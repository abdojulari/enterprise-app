import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: [
      {
        label: 'Total Campaigns',
        value: '24',
        trend: 12,
        color: 'primary',
        icon: 'mdi-email-outline'
      },
      {
        label: 'Active Subscribers',
        value: '1,254',
        trend: 8,
        color: 'success',
        icon: 'mdi-account-group'
      },
      {
        label: 'Avg Open Rate',
        value: '32%',
        trend: -3,
        color: 'info',
        icon: 'mdi-chart-line'
      },
      {
        label: 'Conversion Rate',
        value: '2.4%',
        trend: 6,
        color: 'warning',
        icon: 'mdi-currency-usd'
      }
    ],
    recentActivity: [
      {
        title: 'Campaign Sent',
        description: 'Monthly Newsletter sent to 1,254 subscribers',
        timestamp: '2 hours ago',
        icon: 'mdi-email-check',
        color: 'success'
      },
      {
        title: 'New Subscribers',
        description: '24 new subscribers added to your list',
        timestamp: '4 hours ago',
        icon: 'mdi-account-plus',
        color: 'primary'
      },
      {
        title: 'Campaign Draft',
        description: 'Product Update draft was saved',
        timestamp: '6 hours ago',
        icon: 'mdi-file-document-edit',
        color: 'info'
      }
    ],
    chartOption: {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Opens', 'Clicks', 'Conversions']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Opens',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: 'Clicks',
          type: 'line',
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: 'Conversions',
          type: 'line',
          data: [150, 232, 201, 154, 190, 330, 410]
        }
      ]
    }
  }),

  actions: {
    async createCampaign(campaign: any) {
      // TODO: Implement API call
      console.log('Creating campaign:', campaign)
      return Promise.resolve(campaign)
    }
  }
})
