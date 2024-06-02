#!/bin/bash

git pull \
  && yarn prisma generate \
  && yarn prisma migrate deploy \
  && service spacedrepetitionreader stop \
  && service spacedrepetitionreader start

