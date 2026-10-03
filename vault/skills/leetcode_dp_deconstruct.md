# Skill: DP State Space Decomposition
**ID**: SKILL-DP-084
**Verified On**: Local Sandbox (3/3 assertions passed)

```python
def decompose_dp_state(problem_constraints: dict, current_hypothesis: str):
    """
    Socratically validates whether the recurrence relation satisfies optimal substructure.
    Returns targeted diagnostic prompt.
    """
    if "overlap" not in current_hypothesis:
        return "Have you verified if subproblems are independent or overlapping?"
    return "Consider formulating the state as dp[i][j] representing the optimal cost in window [i, j]."
```
