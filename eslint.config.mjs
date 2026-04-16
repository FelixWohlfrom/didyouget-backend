// @ts-check

import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.strict,
  stylistic.configs.recommended,
  [
    globalIgnores(['dist/*', '.jest/setEnvVars.js']),
  ],
)
