#include <stdio.h>
#include <limits.h>

#define MAX 100

int greedy(int coins[], int n, int amount, int result[]) {
    int count = 0;
    for (int i = n - 1; i >= 0; i--) {
        while (amount >= coins[i]) {
            amount -= coins[i];
            result[count++] = coins[i];
        }
    }
    return count;
}

int dp(int coins[], int n, int amount, int result[]) {
    int dp[MAX], last[MAX];

    for (int i = 0; i <= amount; i++) {
        dp[i] = INT_MAX;
        last[i] = -1;
    }

    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int j = 0; j < n; j++) {
            if (coins[j] <= i && dp[i - coins[j]] != INT_MAX) {
                if (dp[i] > dp[i - coins[j]] + 1) {
                    dp[i] = dp[i - coins[j]] + 1;
                    last[i] = coins[j];
                }
            }
        }
    }

    int count = 0;
    while (amount > 0) {
        result[count++] = last[amount];
        amount -= last[amount];
    }

    return count;
}

int main() {
    int n, amount;

    printf("Enter number of coin types: ");
    scanf("%d", &n);

    int coins[n];
    printf("Enter coin values: ");
    for (int i = 0; i < n; i++) {
        scanf("%d", &coins[i]);
    }

    printf("Enter amount: ");
    scanf("%d", &amount);

    int greedy_res[MAX], dp_res[MAX];

    int g = greedy(coins, n, amount, greedy_res);
    int d = dp(coins, n, amount, dp_res);

    printf("\n--- Result ---\n");

    printf("Greedy (%d coins): ", g);
    for (int i = 0; i < g; i++) {
        printf("%d ", greedy_res[i]);
    }

    printf("\nDP (%d coins): ", d);
    for (int i = 0; i < d; i++) {
        printf("%d ", dp_res[i]);
    }

    FILE *fp = fopen("history.txt", "a");

    if (fp != NULL) {
        fprintf(fp, "\n-----------------------------\n");
        fprintf(fp, "Number of Coin Types: %d\n", n);

        fprintf(fp, "Coins Entered: ");
        for (int i = 0; i < n; i++) {
            fprintf(fp, "%d ", coins[i]);
        }

        fprintf(fp, "\nAmount: %d\n", amount);

        fprintf(fp, "Greedy (%d coins): ", g);
        for (int i = 0; i < g; i++) {
            fprintf(fp, "%d ", greedy_res[i]);
        }

        fprintf(fp, "\nDP (%d coins): ", d);
        for (int i = 0; i < d; i++) {
            fprintf(fp, "%d ", dp_res[i]);
        }

        fprintf(fp, "\n-----------------------------\n");
        fclose(fp);
    }

    printf("\n\nDetailed history saved!\n");

    return 0;
}
