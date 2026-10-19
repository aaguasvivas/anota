// Xcode 27 rejects any target whose iOS deployment target is below 15.0, and
// several pods (resource bundles from AsyncStorage, Google Mobile Ads, UMP,
// Reachability) still declare 12.0 or 13.4. Raise every pod target to the
// app's own minimum in the Podfile's post_install so a clean prebuild builds.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const MIN_IOS = '15.1';
const MARKER = '# anota: raise pod deployment targets';

const SNIPPET = `
    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build|
        current = build.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || Gem::Version.new(current) < Gem::Version.new('${MIN_IOS}')
          build.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MIN_IOS}'
        end
      end
    end
`;

module.exports = function withMinPodDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const src = fs.readFileSync(podfile, 'utf8');
      if (src.includes(MARKER)) return cfg;
      const anchor = /(react_native_post_install\([\s\S]*?\n\s*\)\n)/;
      if (!anchor.test(src)) {
        throw new Error('withMinPodDeploymentTarget: post_install anchor not found in Podfile');
      }
      fs.writeFileSync(podfile, src.replace(anchor, `$1${SNIPPET}`));
      return cfg;
    },
  ]);
};
