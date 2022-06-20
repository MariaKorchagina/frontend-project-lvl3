develop:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack


	develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .