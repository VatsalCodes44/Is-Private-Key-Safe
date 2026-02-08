#!/bin/bash

ENTRY="index.js"
RPC_URL1=""
RPC_URL2=""
RPC_URL3=""
RPC_URL4=""
RPC_URL5=""
RPC_URL6=""
RPC_URL7=""


for i in 1 2 3 4 5 6 7; do
  RPC_URL="$RPC_URL" \
  timeout=3 \
  FILE_NAME="keys${i}.txt" \
  node "$ENTRY" &
done

wait
