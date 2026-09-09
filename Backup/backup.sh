#!/bin/sh
set -eu

GDRIVE_REPO="rclone:gdrive:"
[ "$#" -eq 0 ] || exec restic -r "$GDRIVE_REPO" "$@"

echo "[BACKUP] [GDRIVE] Starting backup..."
echo "[BACKUP] [GDRIVE] Streaming database dump..."
restic -r "$GDRIVE_REPO" backup --host terminal --stdin-from-command --stdin-filename terminal_db.sql \
    -- pg_dump -U "$POSTGRES_USER" -h database -d "$POSTGRES_DB"
restic -r "$GDRIVE_REPO" forget --host terminal --keep-hourly 24 --keep-daily 7 --keep-monthly 6 --prune

if [ -z "$RESTIC_SFTP_HOST" ] || [ -z "$RESTIC_SFTP_USER" ] || [ -z "$RESTIC_SFTP_REPO_PATH" ] || [ -z "$RESTIC_SFTP_KEY_PATH" ]; then
    echo "[BACKUP] [SFTP] Missing SFTP configuration."
    exit 1
fi

echo "[BACKUP] [SFTP] Starting backup..."
SFTP_REPO="sftp:${RESTIC_SFTP_USER}@${RESTIC_SFTP_HOST}:${RESTIC_SFTP_REPO_PATH}"
SFTP_ARGS="-i /auth/id_rsa -o StrictHostKeyChecking=no -p ${RESTIC_SFTP_PORT:-22}"

if ! restic -r "$SFTP_REPO" -o sftp.args="$SFTP_ARGS" snapshots > /dev/null 2>&1; then
    echo "[BACKUP] [SFTP] Initializing repository..."
    restic -r "$SFTP_REPO" -o sftp.args="$SFTP_ARGS" init
fi

echo "[BACKUP] [SFTP] Streaming database dump..."
restic -r "$SFTP_REPO" -o sftp.args="$SFTP_ARGS" backup --host terminal --stdin-from-command --stdin-filename terminal_db.sql \
    -- pg_dump -U "$POSTGRES_USER" -h database -d "$POSTGRES_DB"
restic -r "$SFTP_REPO" -o sftp.args="$SFTP_ARGS" forget --host terminal --keep-hourly 24 --keep-daily 7 --keep-monthly 6 --prune
