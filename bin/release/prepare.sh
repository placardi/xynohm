#!/bin/bash

# Input variables
versionNumber=$1
releaseNotes=$2

# Branch settings
devBranch=develop
masterBranch=master
releaseBranch=release-v$versionNumber

# Create a release branch from develop branch
git checkout -b $releaseBranch $devBranch

# Commit release notes
git add CHANGELOG.md
git commit --no-verify -m "$(echo -e "chore(release): Release notes for version $versionNumber [skip ci]\n\n$releaseNotes")"

# Commit version number increment
git add package.json package-lock.json npm-shrinkwrap.json
git commit --no-verify -m "chore(release): Bumped version number to $versionNumber [skip ci]."

# Merge release branch into master branch
git checkout $masterBranch
git merge --no-ff --no-edit $releaseBranch

# Create tag for new version from master branch
git tag -a $versionLabel -m "Version $versionNumber tag."

# Push master branch and tags
git push --follow-tags

# Merge release branch back into develop branch
git checkout $devBranch
git merge --no-ff --no-edit $releaseBranch

# Push develop branch
git push

# Remove release branch
git branch -d $releaseBranch
