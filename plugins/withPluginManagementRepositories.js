const { withSettingsGradle } = require("@expo/config-plugins");

module.exports = function withPluginManagementRepositories(config) {
  return withSettingsGradle(config, (modConfig) => {
    if (!modConfig.modResults.contents.includes("gradlePluginPortal()")) {
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        /pluginManagement\s*\{/,
        `pluginManagement {
  repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
  }`
      );
    }
    return modConfig;
  });
};
