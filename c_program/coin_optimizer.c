#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

static const char *HISTORY_FILE = "c_program/history.txt";

static int compare_ints(const void *a, const void *b) {
    int lhs = *(const int *)a;
    int rhs = *(const int *)b;
    return (lhs > rhs) - (lhs < rhs);
}

int greedy(int coins[], int n, int amount, int result[]) {
    int count = 0;
    for (int i = n - 1; i >= 0; i--) {
        while (amount >= coins[i]) {
            amount -= coins[i];
            result[count++] = coins[i];
        }
    }
    return amount == 0 ? count : -1;
}

int dp(int coins[], int n, int amount, int result[]) {
    int *dp = malloc((amount + 1) * sizeof(int));
    int *last = malloc((amount + 1) * sizeof(int));

    if (dp == NULL || last == NULL) {
        free(dp);
        free(last);
        return -1;
    }

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

    if (last[amount] == -1) {
        free(dp);
        free(last);
        return -1;
    }

    int count = 0;
    while (amount > 0) {
        result[count++] = last[amount];
        amount -= last[amount];
    }

    free(dp);
    free(last);
    return count;
}

int main() {
    int n, amount;

    printf("Enter number of coin types: ");
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Invalid number of coin types.\n");
        return 1;
    }

    int *coins = malloc(n * sizeof(int));
    if (coins == NULL) {
        printf("Memory allocation failed.\n");
        return 1;
    }

    printf("Enter coin values: ");
    for (int i = 0; i < n; i++) {
        if (scanf("%d", &coins[i]) != 1 || coins[i] <= 0) {
            printf("Invalid coin value.\n");
            free(coins);
            return 1;
        }
    }

    printf("Enter amount: ");
    if (scanf("%d", &amount) != 1 || amount < 0) {
        printf("Invalid amount.\n");
        free(coins);
        return 1;
    }

    qsort(coins, n, sizeof(int), compare_ints);

    int *greedy_res = malloc((amount + 1) * sizeof(int));
    int *dp_res = malloc((amount + 1) * sizeof(int));
    if (greedy_res == NULL || dp_res == NULL) {
        printf("Memory allocation failed.\n");
        free(coins);
        free(greedy_res);
        free(dp_res);
        return 1;
    }

    int g = greedy(coins, n, amount, greedy_res);
    int d = dp(coins, n, amount, dp_res);

    printf("\n--- Result ---\n");

    if (g >= 0) {
        printf("Greedy (%d coins): ", g);
        for (int i = 0; i < g; i++) {
            printf("%d ", greedy_res[i]);
        }
    } else {
        printf("Greedy: no solution");
    }

    if (d >= 0) {
        printf("\nDP (%d coins): ", d);
        for (int i = 0; i < d; i++) {
            printf("%d ", dp_res[i]);
        }
    } else {
        printf("\nDP: no solution");
    }

    FILE *fp = fopen(HISTORY_FILE, "a");

    if (fp != NULL) {
        fprintf(fp, "\n-----------------------------\n");
        fprintf(fp, "Number of Coin Types: %d\n", n);

        fprintf(fp, "Coins Entered: ");
        for (int i = 0; i < n; i++) {
            fprintf(fp, "%d ", coins[i]);
        }

        fprintf(fp, "\nAmount: %d\n", amount);

        if (g >= 0) {
            fprintf(fp, "Greedy (%d coins): ", g);
            for (int i = 0; i < g; i++) {
                fprintf(fp, "%d ", greedy_res[i]);
            }
        } else {
            fprintf(fp, "Greedy: no solution");
        }

        if (d >= 0) {
            fprintf(fp, "\nDP (%d coins): ", d);
            for (int i = 0; i < d; i++) {
                fprintf(fp, "%d ", dp_res[i]);
            }
        } else {
            fprintf(fp, "\nDP: no solution");
        }

        fprintf(fp, "\n-----------------------------\n");
        fclose(fp);
    } else {
        printf("\n\nCould not save history to %s\n", HISTORY_FILE);
    }

    printf("\n\nDetailed history saved!\n");

    free(coins);
    free(greedy_res);
    free(dp_res);
    return 0;
}
