/**
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
  siteUrl: 'https://ssio-imu.github.io',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
};
