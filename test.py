def isMatchHelper(s, p):
    return p == '.' or s == p

def isMatch(s, p):
    m, n = len(s), len(p)
    
    # Initialize dp table
    dp = [[0 for i in range(n + 1)] for j in range(m + 1)]
    dp[0][0] = 1
    
    # Handle patterns with leading *
    for i in range(2, n + 1):
        if p[i - 1] == '*':
            dp[0][i] = dp[0][i - 2]
    
    # Fill dp table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i][j - 2] or (isMatchHelper(s[i - 1], p[j - 2]) and dp[i - 1][j])
            else:
                if isMatchHelper(s[i - 1], p[j - 1]):
                    dp[i][j] = dp[i - 1][j - 1]
    for i in range(m + 1):
        for j in range(n + 1):
            x = 1 if dp[m][n] else 0
            print(x, end=" ")
        print()
    return dp[m][n]

print(isMatch(input("String: ").strip(), input("Pattern: ").strip()))
