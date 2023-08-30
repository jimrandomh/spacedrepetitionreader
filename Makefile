
all: lint tsc

tsc:
	@yarn --silent tsc
lint:
	@yarn --silent lint

