CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = coin
SRC = coin_optimizer.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)

.PHONY: all run clean
