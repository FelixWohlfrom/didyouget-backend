/**
 * A helper class to read environment variables and return a default
 * value if not set. If no default value is given, an error is thrown.
 *
 * @class
 */
class EnvReader {
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
}

export const envReader = new EnvReader();
