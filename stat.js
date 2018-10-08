const data = require('./libs/data');
const chart = require('./libs/chart');
const queries = require('./libs/queries');

const show = async function (args) {
  const getTeams = data.all(`select id, noc_name from teams`);
  const seasons = { 'winter': 1, 'summer': 0 };
  const medals = { 'gold': 1, 'silver': 2, 'bronze': 3 };
  const teams = await getTeams();

  let noc, season, medal, year;

  args.forEach(arg => {
    if (seasons.hasOwnProperty(arg.toLowerCase())) {
      season = seasons[arg.toLowerCase()];
    }
    else if (medals.hasOwnProperty(arg.toLowerCase())) {
      medal = medals[arg.toLowerCase()] || 0;
    }
    else if (/^(18|19|20)[0-9]{2}$/.test(arg)) {
      year = arg;
    }
    else if (teams.some(noc => noc.noc_name === arg.toUpperCase())) {
      noc = arg.toUpperCase();
    }
    else {
      throw new Error(`Unrecognisable param: ${arg}`);
      data.close();
    }
  });

  if (season === undefined) {
    throw new Error('You have to specify season param!');
    data.close();
  }

  if (noc) {
    const getAmountOfMedals = data.all(queries.getAmountOfMedalsQuery(season, noc, medal));
    let rows = await getAmountOfMedals();
    rows = rows.map(row => [row.Year, row.Amount || 0]);
    chart.draw(rows, 'medals', ['Year', 'Amount']);
  } else {
    const getTopTeams = data.all(queries.getTopTeamsQuery(season, year, medal));
    let rows = await getTopTeams();
    rows = rows.map(row => [row.NOC, row.Amount || 0]);
    chart.draw(rows, 'top-teams', ['NOC', 'Amount']);
  }

  data.close();
};

if (!module.parent) show(process.argv.slice(2));

exports.show = show;