#!/bin/bash

git pull \
  && yarn prisma generate \
  && yarn prisma migrate deploy \
  service spacedrepetitionreader restart

