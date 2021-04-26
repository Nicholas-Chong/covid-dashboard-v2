import React from 'react'
import styled from 'styled-components'
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
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  }

  async getData() {
    const dataUrl = 'https://evening-caverns-69599.herokuapp.com'
    const fetched = await fetch(dataUrl)
    const response = await fetched.json()
    response.data.sort((a, b) => (a.id - b.id))
    console.log(response)

    var dailyCases = [[
      'Date', 'New Cases', 'New Deaths', 'Active Cases', 'Total Deaths', 
      'Total Resolved', 'Total Active',
    ]]
    var data2 = [[
      'Date', 'New Vaccinations', 'Num Fully Vaccinated', 'Num Part Vaccinated',
    ]]
    var data3 = [[
      'Date', 'B117 (UK)', 'B1351 (South Africa)', 'P1 (Brazil)',
    ]]
    response.data.forEach(element => {
      const dateStr = element.date_string.split('-')
      dailyCases.push([
        new Date(parseInt(dateStr[0]), parseInt(dateStr[1])-1, parseInt(dateStr[2])), 
        element.ts_cases.new_cases,
        element.ts_cases.new_deaths,
        element.ts_cases.total_cases,
        element.ts_cases.total_deaths,
        element.ts_cases.total_resolved,
        element.ts_cases.total_active,
      ])

      if (element.ts_vacci) {
        const dateStr = element.date_string.split('-')
        data2.push([
          new Date(parseInt(dateStr[0]), parseInt(dateStr[1])-1, parseInt(dateStr[2])), 
          element.ts_vacci.new_vaccinations,
          element.ts_vacci.num_fully_vaccinated, 
          element.ts_vacci.num_part_vaccinated,
        ])
      }

      if (element.ts_variant) {
        data3.push([
          new Date(parseInt(dateStr[0]), parseInt(dateStr[1])-1, parseInt(dateStr[2])), 
          element.ts_variant.b117,
          element.ts_variant.b1351,
          element.ts_variant.p1,
        ])
      }
    })  

    // Load the google charts library
    await window.google.charts.load('current', {packages: ['corechart']})

    const dailyCaseData = window.google.visualization.arrayToDataTable(dailyCases)
    const dailyVacciData = window.google.visualization.arrayToDataTable(data2)
    const dailyVarriantData = window.google.visualization.arrayToDataTable(data3)

    this.setState({
      newCases: dailyCaseData.getValue(dailyCaseData.getNumberOfRows()-1, 1),
      newDeaths: dailyCaseData.getValue(dailyCaseData.getNumberOfRows()-1, 2),
      newVacci: dailyVacciData.getValue(dailyVacciData.getNumberOfRows()-1, 1),
      totalCases: dailyCaseData.getValue(dailyCaseData.getNumberOfRows()-1, 3),
      covidData: response,
      dailyCasesChartData: {gTable: dailyCaseData},
      dailyVacciChartData: {gTable: dailyVacciData},
      dailyVarriantChartData: {gTable: dailyVarriantData}
    })
  }

  async componentDidMount() {
    await this.getData()
    this.drawDailyCasesChart()
    this.drawDailyVaccineChart()
    this.drawTotalCaseDeathChart()
    this.drawTotalVaccineChart()
    this.drawDailyDeathsChart()
    this.drawTotalVariantChart()
    
    if (!this.state.isMobile) {
      window.addEventListener('resize', () => {
        this.drawDailyCasesChart()
        this.drawDailyVaccineChart()
        this.drawTotalCaseDeathChart()
        this.drawTotalVaccineChart()
        this.drawDailyDeathsChart()
        this.drawTotalVariantChart()
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
      animation: {
        startup: !this.state.isMobile,
        duration: 800,
        easing: 'out',
      },
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
      animation: {
        startup: !this.state.isMobile,
        duration: 800,
        easing: 'out',
      },
    }

    const domElement = document.getElementById(domId)
    var chart = new window.google.visualization.ColumnChart(domElement)
    chart.draw(dataView, options)
  }

  drawDailyCasesChart() {
    const gTable = this.state.dailyCasesChartData.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)
    dataToDraw.hideColumns([2,3,4,5,6])
    this.drawLineChart(dataToDraw.toDataTable(), 'Daily New Cases', 'dailyCasesChart')
  }

  drawDailyDeathsChart() {
    const gTable = this.state.dailyCasesChartData.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)
    dataToDraw.hideColumns([1,3,4,5,6])
    this.drawLineChart(dataToDraw.toDataTable(), 'Daily New Deaths', 'dailyDeathsChart')
  }

  drawTotalCaseDeathChart() {
    const gTable = this.state.dailyCasesChartData.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)
    dataToDraw.hideColumns([1,2,3])
    this.drawStackedBarChart(dataToDraw.toDataTable(), 'Total Case Summary', 'totalCaseDataChart')
  }

  drawDailyVaccineChart() {
    const gTable = this.state.dailyVacciChartData.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)
    dataToDraw.hideColumns([2,3])
    this.drawLineChart(dataToDraw, 'Daily New Vaccinations', 'dailyVaccinationChart')
  }

  drawTotalVaccineChart() {
    const gTable = this.state.dailyVacciChartData.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)
    dataToDraw.setColumns([0,2,3])
    this.drawStackedBarChart(dataToDraw.toDataTable(), 'Total Vaccinations Summary', 'totalVaccinationChart')

    /* 
    Bug caused when using animation.startup = true with DataView. Had to 
    return DataTable object chart.draw() to get the startup animation to work.
    Caused by the hiding/setting of columns.
    https://stackoverflow.com/questions/41512880/google-chart-chartwrapper-getting-invalid-column-index
    */
  }

  drawTotalVariantChart() {
    const gTable = this.state.dailyVarriantChartData.gTable
    const dataToDraw = new window.google.visualization.DataView(gTable)
    this.drawStackedBarChart(dataToDraw.toDataTable(), 'Total Variants Summary', 'totalVariantsChart')
  }

  render() {
    var todaysDate = new Date()
    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    if (this.state.dailyCasesChartData != null) {
      const gTable = this.state.dailyCasesChartData.gTable
      todaysDate = gTable.getValue(gTable.getNumberOfRows()-1, 0)
    }

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
            <div style={{width: '95%', height: '95%'}} id='dailyCasesChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <div style={{width: '95%', height: '95%'}} id='dailyDeathsChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <div style={{width: '95%', height: '95%'}} id='totalCaseDataChart'/>
          </ChartWrapper>
        </Section>
        <Section>
          <h2>Vaccination</h2>
          <ChartWrapper>
            <div style={{width: '95%', height: '95%'}} id='dailyVaccinationChart'/>
          </ChartWrapper>
          <ChartWrapper>
            <div style={{width: '95%', height: '95%'}} id='totalVaccinationChart'/>
          </ChartWrapper>
        </Section>
        <Section>
          <h2>Variants</h2>
          <ChartWrapper>
            <div style={{width: '95%', height: '95%'}} id='totalVariantsChart'/>
          </ChartWrapper>
        </Section>
        <Section style={{marginBottom: '20px', fontSize: '30px'}}>
          <center>
            <a href='https://www.google.com/' target='_blank' rel="noreferrer"><i class='bx bxl-github'></i></a>
            <a href='https://twitter.com/OntarioCovid19' target='_blank' rel="noreferrer"><i class='bx bxl-twitter'></i></a>
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

const Section = styled.div`
  padding-top: 20px;

  a {
    color: black !important;
  }
`

export default Home