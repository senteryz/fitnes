/**
 * github-db.js — Интеграция базы данных db.json через GitHub API
 * Позволяет сайту работать как полноценный headless CMS без сторонних платных БД.
 * Изменения автоматически коммитятся в GitHub репозиторий.
 */

const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
const GITHUB_REPO = (process.env.GITHUB_REPO || 'senteryz/fitnes').trim();
const GITHUB_BRANCH = (process.env.GITHUB_BRANCH || 'main').trim();
const GITHUB_PATH = (process.env.GITHUB_PATH || 'data/db.json').trim();

let lastSha = null;
let lastSyncTime = null;
let lastError = null;
let isWriting = false;
let pendingWrite = null;

function isEnabled() {
  return Boolean(GITHUB_TOKEN);
}

function getStatus() {
  return {
    enabled: isEnabled(),
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    path: GITHUB_PATH,
    lastSha: lastSha ? lastSha.slice(0, 7) : null,
    lastSyncTime,
    lastError: lastError ? (lastError.message || String(lastError)) : null
  };
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Aura-Fitness-CMS',
    'Content-Type': 'application/json'
  };
}

/**
 * Получить метаданные файла (включая актуальный sha) с GitHub
 */
async function fetchFileMeta() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API Error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  lastSha = data.sha;
  return data;
}

/**
 * Загрузить db.json из GitHub репозитория
 */
async function loadFromGitHub() {
  if (!isEnabled()) {
    throw new Error('GITHUB_TOKEN не задан');
  }

  try {
    console.log(`📡 [GitHub DB] Загрузка данных из ${GITHUB_REPO}/${GITHUB_PATH} (ветка: ${GITHUB_BRANCH})...`);
    const data = await fetchFileMeta();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const parsed = JSON.parse(content);
    lastSyncTime = new Date().toISOString();
    lastError = null;
    console.log(`✅ [GitHub DB] База успешно загружена (SHA: ${lastSha.slice(0, 7)})`);
    return parsed;
  } catch (err) {
    lastError = err;
    console.error('⚠️ [GitHub DB] Ошибка загрузки из GitHub:', err.message);
    throw err;
  }
}

/**
 * Сохранить (закоммитить) db.json в GitHub репозиторий
 */
async function commitToGitHub(dbData, commitMessage = 'Update db.json from Aura Admin') {
  if (!isEnabled()) {
    return false;
  }

  // Очередь записи, чтобы избежать параллельных конфликтов коммитов
  if (isWriting) {
    pendingWrite = { dbData, commitMessage };
    return;
  }

  isWriting = true;
  try {
    // Если еще нет SHA, запрашиваем
    if (!lastSha) {
      await fetchFileMeta();
    }

    const jsonStr = JSON.stringify(dbData, null, 2);
    const base64Content = Buffer.from(jsonStr, 'utf8').toString('base64');

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    const payload = {
      message: `${commitMessage} [skip ci]`,
      content: base64Content,
      branch: GITHUB_BRANCH,
      sha: lastSha
    };

    let res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    // При 409 Conflict (SHA изменился внешне) обновляем актуальный SHA и пробуем снова
    if (res.status === 409) {
      console.warn('⚠️ [GitHub DB] Конфликт SHA, обновляем метаданные и повторяем коммит...');
      const meta = await fetchFileMeta();
      payload.sha = meta.sha;
      res = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GitHub Commit Error (${res.status}): ${errText}`);
    }

    const resData = await res.json();
    lastSha = resData.content?.sha || resData.commit?.sha || lastSha;
    lastSyncTime = new Date().toISOString();
    lastError = null;
    console.log(`🚀 [GitHub DB] Успешный коммит: "${commitMessage}" (SHA: ${lastSha ? lastSha.slice(0, 7) : 'ok'})`);
    return true;
  } catch (err) {
    lastError = err;
    console.error('⚠️ [GitHub DB] Ошибка коммита в GitHub:', err.message);
    return false;
  } finally {
    isWriting = false;
    if (pendingWrite) {
      const next = pendingWrite;
      pendingWrite = null;
      commitToGitHub(next.dbData, next.commitMessage);
    }
  }
}

module.exports = {
  isEnabled,
  getStatus,
  loadFromGitHub,
  commitToGitHub
};
