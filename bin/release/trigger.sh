#!/bin/bash

# Branch settings
developBranch=develop
releaseBranch=release

# Switch to develop branch
git checkout $developBranch

# Clean up release branch locally if it exists
if git show-ref -q --heads releaseBranch; then
  git branch -D $releaseBranch
fi

# Create a release branch from develop branch
git checkout -b $releaseBranch $developBranch

# Push release branch to trigger CI build
git push --set-upstream origin $releaseBranch

# Clean up release branch locally
git checkout $developBranch && git branch -D $releaseBranch
