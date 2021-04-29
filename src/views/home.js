import React from 'react'
import styled from 'styled-components'
import MaterialTable from 'material-table'
import { StatCard, StatCardWrapper } from '../components/stat-card'
import { Page } from '../components/global'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newCases: null,
      newDeaths: null,
      newVacci: null,
      totalCases: null,
      todaysDate: null,
      totalVaccinated: 0,
      totalFullyVaccinated: 0,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  }

  async getData() {
    const dataUrl = 'https://evening-caverns-69599.herokuapp.com'
    // const dataUrl = 'http://127.0.0.1:8000'
    const fetched = await fetch(dataUrl)
    const response = await fetched.json()
    console.log(response)

    // Load the google charts library
    await window.google.charts.load('current', {packages: ['corechart']})

    var totalVaccinated = 0
    const gTable = window.google.visualization.arrayToDataTable(response.data)

    gTable.insertColumn(0, 'date', 'Date')
    for (var i=0; i < gTable.getNumberOfRows(); i++) {
      var dateStr = gTable.getValue(i, 1).split('-')
      gTable.setValue(i, 0, new Date(parseInt(dateStr[0]), parseInt(dateStr[1])-1, parseInt(dateStr[2])))
      totalVaccinated += gTable.getValue(i, 9)
    }

    gTable.removeColumn(1)
    console.log(gTable)

    const lastRowIndex = gTable.getNumberOfRows()-1

    this.setState({
      newCases: gTable.getValue(lastRowIndex, 1),
      newDeaths: gTable.getValue(lastRowIndex, 2),
      newVacci: gTable.getValue(lastRowIndex, 9),
      totalCases: gTable.getValue(lastRowIndex, 5),
      todaysDate: gTable.getValue(lastRowIndex, 0),
      totalVaccinated: totalVaccinated,
      totalFullyVaccinated: gTable.getValue(lastRowIndex, 10),
      covidData: response,
      gTable: gTable,
    })
  }

  async componentDidMount() {
    await this.getData()
    this.drawCharts()
    
    if (!this.state.isMobile) {
      window.addEventListener('resize', () => {
        this.drawCharts()
      })
    }
  }

  drawLineChart(dataView, title, domId) {
    var options = {
      title: title,
      curveType: 'function',
      legend: { position: 'bottom' },
      backgroundColor: {fill: 'white'},
      chartArea: {left: '8%', width: '87%'},
      lineWidth: this.state.isMobile ? 1 : 2,
      hAxis: {
        maxTextLines: 1,
        format: 'MMM d, YYYY',
        gridlines: {
          color: 'transparent',
        },
      },
      vAxis: {
        format: 'short',
        viewWindowMode: 'pretty',
        viewWindow: {
          min: 0,
        },
      },
    }

    const domElement = document.getElementById(domId)
    var chart = new window.google.visualization.LineChart(domElement)
    chart.draw(dataView, options)
  }

  drawStackedBarChart(dataView, title, domId) {
    var options = {
      title: title,
      chartArea: {left: '8%', width: '87%'},
      legend: { position: 'bottom', maxLines: 3 },
      bar: { groupWidth: '100%' },
      isStacked: true,
      hAxis: { 
        maxTextLines: 1,
        format: 'MMM-d-YYYY',
        gridlines: {
          color: 'transparent',
        },
      },
      vAxis: {
        format: 'short',
        maxTextLines: 1,
      },
    }

    const domElement = document.getElementById(domId)
    var chart = new window.google.visualization.ColumnChart(domElement)
    chart.draw(dataView, options)
  }

  drawCharts() {
    const gTable = this.state.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)

    dataToDraw.setColumns([0,1])
    this.drawLineChart(
      dataToDraw.toDataTable(), 
      'Daily New Cases', 
      'dailyCasesChart',
    )
    
    dataToDraw.setColumns([0,4])
    this.drawLineChart(
      dataToDraw.toDataTable(), 
      'Daily Percent Positive Tests', 
      'dailyPositivityChart',
    )
    
    dataToDraw.setColumns([0,2])
    this.drawLineChart(
      dataToDraw.toDataTable(), 
      'Daily New Deaths', 
      'dailyDeathsChart',
    )
    
    dataToDraw.setColumns([0,6,7,8])
    this.drawStackedBarChart(
      dataToDraw.toDataTable(), 
      'Total Case Summary',
      'totalCaseDataChart',
    )

    dataToDraw.setRows(gTable.getFilteredRows([
      {column: 0, minValue: new Date(2021, 0, 1)}
    ]))
    dataToDraw.setColumns([0,9])
    this.drawLineChart(
      dataToDraw.toDataTable(),
      'Daily New Vaccinations', 
      'dailyVaccinationChart',
    )

    dataToDraw.setRows(gTable.getFilteredRows([
      {column: 0, minValue: new Date(2021, 0, 1)}
    ]))
    dataToDraw.setColumns([0,10,11])
    this.drawStackedBarChart(
      dataToDraw.toDataTable(), 
      'Total Vaccinations Summary', 
      'totalVaccinationChart',
    )

    dataToDraw.setRows(gTable.getFilteredRows([
      {column: 0, minValue: new Date(2021, 0, 1)}
    ]))
    dataToDraw.setColumns([0,12,13,14])
    console.log(dataToDraw)
    this.drawStackedBarChart(
      dataToDraw.toDataTable(), 
      'Total Variants Summary', 
      'totalVariantsChart',
    )

    /* 
    Bug caused when using animation.startup = true with DataView. Had to 
    return DataTable object chart.draw() to get the startup animation to work.
    Caused by the hiding/setting of columns.
    https://stackoverflow.com/questions/41512880/google-chart-chartwrapper-getting-invalid-column-index
    */
  }

  render() {
    var todaysDate = this.state.todaysDate ? this.state.todaysDate : new Date()
    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }
    var percentVaccinatedAdult = ((this.state.totalVaccinated/(10.5*1000000))*100).toFixed(2)
    var percentFullyVaccinatedAdult = ((this.state.totalFullyVaccinated/(10.5*1000000))*100).toFixed(2)
    var percentVaccinatedTotal = ((this.state.totalVaccinated/(14.8*1000000))*100).toFixed(2)

    const tableColumns = [
      {title: 'Region', field: 'region'},
      {title: 'New Cases', field: 'new cases', defaultSort: 'desc'},
    ]

    return(
      <Page>
        <center><h1>Ontario COVID-19 Dashboard</h1></center>
        <h2>{todaysDate.toLocaleDateString("en-US", options)} Snapshot</h2>
        <StatCardWrapper>
          <StatCard value={this.state.newCases} name='New Cases'/>
          <StatCard value={this.state.newDeaths}name='New Deaths'/>
          <StatCard value={this.state.newVacci} name='New Vaccinations'/>
          <StatCard value={this.state.totalCases} name='Total Cases'/>
        </StatCardWrapper>
        <Section>
          <h2>Cases and Deaths</h2>
          <ChartWrapper>
            <Chart id='dailyCasesChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <Chart id='dailyPositivityChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <Chart id='dailyDeathsChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <Chart id='totalCaseDataChart'/>
          </ChartWrapper>
        </Section>
        <Section>
          <h2>Vaccination</h2>
          <ChartWrapper>
            <Chart id='dailyVaccinationChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <Chart id='totalVaccinationChart'/>
          </ChartWrapper>
          <StatCardWrapper marginTop>
            <StatCard 
              value={`${percentVaccinatedTotal}%`} 
              name='of all Ontario residents have recieved at least one dose of a vaccine'
            />
            <StatCard 
              value={`${percentVaccinatedAdult}%`} 
              name='of Ontario adults have recieved at least one dose of a vaccine'
            />
            <StatCard 
              value={`${percentFullyVaccinatedAdult}%`} 
              name='of Ontario adults are fully vaccinated'
            />
          </StatCardWrapper>
        </Section>
        <Section>
          <h2>Regional</h2>
          <MaterialTable 
            columns={tableColumns} 
            data={this.state.covidData ? this.state.covidData.regional_data : []}
            title='Daily New Cases By Region'
            style={{
              borderRadius: '10px', boxShadow: 'none', 
              filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
              color: 'black',
            }}
          />
        </Section>
        <Section>
          <h2>Variants</h2>
          <ChartWrapper>
            <Chart id='totalVariantsChart'/>
          </ChartWrapper>
        </Section>
        <Section style={{marginBottom: '20px'}}>
          <center>
            <a 
              href='https://github.com/Nicholas-Chong/covid-dashboard-v2' 
              target='_blank' rel="noreferrer" style={{fontSize: '30px'}}
            >
              <i class='bx bxl-github'/>
            </a>
            <a 
              href='https://twitter.com/OntarioCovid19' target='_blank' 
              rel="noreferrer" style={{fontSize: '30px'}} 
            >
              <i class='bx bxl-twitter'/> 
            </a>
            <p>Last updated: {todaysDate.toLocaleDateString("en-US", options)}</p>
          </center>
        </Section>
      </Page>
    )
  }
}

const ChartWrapper = styled.div`
  margin-top: 20px;
  background-color: white;
  border-radius: 10px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  display: flex;
  justify-content: center;
  height: 40vh;
`

const Chart = styled.div`
  width: 95%;
  height: 95%;
`

const Section = styled.div`
  padding-top: 20px;

  a {
    color: black !important;
  }
`

export default Home