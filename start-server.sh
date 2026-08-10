#!/bin/bash
cd /home/z/my-project
while true; do
  bun run dev
  echo "Server exited, restarting in 2s..."
  sleep 2
done
