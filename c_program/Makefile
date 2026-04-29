CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = coin
SRC = coin_optimizer.c

ifeq ($(OS),Windows_NT)
    EXE = .exe
    RM = del /Q
else
    EXE =
    RM = rm -f
endif

all: $(TARGET)$(EXE)

$(TARGET)$(EXE): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET)$(EXE) $(SRC)

run: $(TARGET)$(EXE)
	./$(TARGET)$(EXE)

clean:
	-$(RM) $(TARGET)$(EXE)

.PHONY: all run clean
