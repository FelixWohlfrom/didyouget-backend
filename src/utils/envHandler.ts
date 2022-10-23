/**
 * A helper class to make handling with the environment easier.
 *
 * @class
 */
class EnvHandler {
    /**
     * Will return the given environment variable. If not set, default value will be returned.
     * If no default value is given, an error is thrown.
     *
     * @param {string} envVar The environment variable to read.
     * @param {string} defaultValue The default value to return.
     * @return {string | undefined} Either the value of the environment variable or the default value.
     */
    get(envVar: string, defaultValue?: string): string {
        if (process.env[envVar] || defaultValue) {
            return process.env[envVar] ?? defaultValue ?? "";
        }
        throw new Error(
            "Please define a value for environment variable " + envVar
        );
    }

    /**
     * Will return true if we are currently executed in an development instance.
     *
     * @return {boolean} True if we are executed in an development instance.
     */
    isDevelopmentInstance(): boolean {
        return this.get("NODE_ENV", "development") == "development";
    }
}

export const envHandler = new EnvHandler();
