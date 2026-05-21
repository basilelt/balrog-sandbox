# balrog-sandbox
Test repo for PR Balrog

## Test: history banner feature

This PR tests the fighting banner and attempt history features of PR Balrog.

### What is PR Balrog?

PR Balrog forces developers to prove they understand their own pull request before merging.
An AI generates a quiz based on the actual diff — testing the **why** and the trade-offs.

### New features being tested

#### Fighting banner

When you submit answers, the quiz comment immediately shows:

> ⚔️ **Balrog is fighting you...** evaluating your answers, hold the line.

This gives instant feedback that evaluation is in progress, instead of silence.

#### Attempt history

After a failed attempt, the quiz comment shows a collapsible block at the top:

```
📜 Past attempts (1)
- Attempt 1: Q1: A · Q2: B — 33%
```

This lets you learn from previous mistakes without clogging the PR timeline.

### How it works

1. The quiz artifact now stores an `attempts` array
2. Each attempt records: attempt number, submitted answers, score
3. The render functions prepend a `<details>` block when attempts exist
4. The evaluate action updates the quiz comment with the banner before running eval

### Configuration

```yaml
- uses: basilelt/pr-balrog/evaluate@feat/checkbox-answer-mode
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    language: 'auto'
```
