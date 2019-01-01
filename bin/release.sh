#!/bin/bash

if [[ -z $1 ]]; then
  echo "Enter new version: "
  read -r VERSION
else
  VERSION=$1
fi

read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing $VERSION ..."

  developBranch=develop
  masterBranch=master
  releaseBranch=release-v$VERSION

  git checkout -b $releaseBranch $developBranch

  npm --no-git-tag-version version "$VERSION"

  git add package.json package-lock.json
  git commit --no-verify -m "Bumped version number to $VERSION."

  git checkout $masterBranch
  git merge --no-ff --no-edit $releaseBranch

  git tag -a $VERSION -m "Version $VERSION tag."

  git push --follow-tags

  npm run build:prod
  npm publish --access public

  git checkout $developBranch
  git merge --no-ff --no-edit $releaseBranch

  SNAPSHOT_VERSION=$(npm --no-git-tag-version version patch | tr -d v)-SNAPSHOT
  git checkout package.json package-lock.json
  npm --no-git-tag-version version $SNAPSHOT_VERSION

  git add package.json package-lock.json
  git commit --no-verify -m "Bumped snapshot version number."

  git push

  git branch -d $releaseBranch
fi
