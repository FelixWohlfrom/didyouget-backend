# didyouget-backend

[![Build](https://github.com/FelixWohlfrom/didyouget-backend/actions/workflows/build.yaml/badge.svg?event=push)](https://github.com/FelixWohlfrom/didyouget-backend/actions/workflows/build.yaml) [![codecov](https://codecov.io/gh/FelixWohlfrom/didyouget-backend/branch/main/graph/badge.svg?token=0E8911CB53)](https://codecov.io/gh/FelixWohlfrom/didyouget-backend) [![CodeQL](https://github.com/FelixWohlfrom/didyouget-backend/actions/workflows/codeql-analysis.yml/badge.svg?event=push)](https://github.com/FelixWohlfrom/didyouget-backend/actions/workflows/codeql-analysis.yml) [![ESLint](https://github.com/FelixWohlfrom/didyouget-backend/actions/workflows/eslint.yml/badge.svg?event=push)](https://github.com/FelixWohlfrom/didyouget-backend/actions/workflows/eslint.yml) [![GitHub license](https://img.shields.io/github/license/FelixWohlfrom/didyouget-backend)](https://github.com/FelixWohlfrom/didyouget-backend/blob/main/LICENSE)

The backend for a small colaborative shopping list app. It's a nodejs package that can be executed standalone or via a dockerfile.
It provides a graphql interface to be used by different frontends (e.g. a website or an android app).
Data is stored in a database. Different database backends like sqlite or mariadb are supported.

## Configuration

The backend configuration can be done via environment variables.
Those can be provided either directly as environment variables or in a .env file in the root directory of this repository.

There are several variables available, which will be described the following chapters.

### General configuration

``HOST`` The IP Adress for the server to wait for new connections. Use 0.0.0.0 for docker images. Default is *localhost*.

``PORT`` The network port for the server to listen to. Default is *4000*.

``NODE_ENV`` The node environment to use. Can be either *development* or *production*. Switch to *development* to get more debugging output in case of issues or to enable an extended graphql user interface to play around with the queries. NEVER run in production with *development* configuration. Defaults to *production*

``JWT_SECRET`` This variable is used to create the signature for the authentication tokens. Please put any random string value in here, the longer the better. No default value, this must be customized.

``ALLOW_REGISTRATION`` If user registration is allowed in this backend. Can be either *true* or *false*. Defaults to *true*.

### Database related configuration

For the database, the variables to configure depend on the backend you are using. E.g. if you use a sqlite database, you need to provide different variables then for mariadb.

``DB_TYPE`` The database backend to use. Currently *better-sqlite3* and *mariadb* are actively supported. For others, pull requests are appreciated. For a full overview about possible values, please check the dialects supported by [typeorm](https://typeorm.io/docs/data-source/data-source-options/).
Default to *better-sqlite3*.

``DB_NAME`` The name of the database to use. In case of sqlite, the name of the database file.
            Use *:memory:* for in-memory database in sqlite.
            Defaults to *data/database.sqlite*

``DB_USER`` The username to use for authentication at the database server.

``DB_PASS`` The password to use for authentication at the database server.

``DB_HOST`` The hostname on which the database server is executed. Only required for *mariadb* dialect. Defaults to *localhost*.

``DB_PORT`` The port on which the database server is listening. Only required for *mariadb* dialect. Defaults to *3306*.

``SYNCHRONIZE`` If the databas schema should be synchronized. *If set to `true`, the data will be wiped*. Use only during
                initial setup.
