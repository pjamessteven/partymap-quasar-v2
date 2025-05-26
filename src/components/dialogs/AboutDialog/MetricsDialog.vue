<template>
  <q-card class="metrics-dialog dialog-card fullscreen-mobile-card">
    <q-card-section class="header row items-center dialog-card-header">
      <div class="inter bolder text-h6">Site Metrics</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="t2 dialog-card-content q-pa-md">
      <div class="row no-wrap q-col-gutter-md">
        <div class="col-12 col-md-5">
          <q-input
            filled
            dense
            label="from"
            v-model="filters.startDate"
            mask="date"
            :rules="['date']"
          >
          </q-input>
        </div>
        <div class="col-12 col-md-5">
          <q-input
            label="to"
            filled
            dense
            v-model="filters.endDate"
            mask="date"
            :rules="['date']"
          >
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-btn
            color="primary"
            flat
            icon="refresh"
            @click="fetchMetrics"
            :loading="loading"
          />
        </div>
      </div>

      <div class="q-my-md">
        <q-inner-loading :showing="loading && !countriesMetrics">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>

        <div v-if="error" class="text-negative q-mb-md">
          {{ error }}
        </div>

        <div
          v-if="
            countriesMetrics && countriesMetrics.total_page_views !== undefined
          "
        >
          <p class="text-body1">
            <strong>Total Page Views in Period:</strong>
            {{ countriesMetrics.total_page_views }}
          </p>

          <q-table
            flat
            bordered
            :rows="countriesMetrics.country_rankings"
            :columns="countryColumns"
            row-key="country"
            hide-pagination
            :rows-per-page-options="[0]"
            v-if="
              countriesMetrics.country_rankings &&
              countriesMetrics.country_rankings.length
            "
          >
            <template v-slot:no-data>
              <q-card-section class="full-width text-center">
                <q-icon name="public" size="lg" color="grey" />
                <div class="text-grey q-mt-sm">
                  No country data available for the selected period.
                </div>
              </q-card-section>
            </template>
          </q-table>
          <p v-else class="text-grey-7 q-mt-md">
            No country data available for the selected period.
          </p>
        </div>
        <div v-else-if="!loading && !error">
          <q-card-section class="full-width text-center">
            <q-icon name="public" size="lg" color="grey" />
            <div class="text-grey q-mt-sm">
              Click 'Refresh Metrics' to load country data.
            </div>
          </q-card-section>
        </div>
      </div>

      <div v-if="currentUserIsStaff">
        <p class="text-body1">
          <strong>URL Metrics:</strong>
        </p>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-4">
            <q-input
              filled
              v-model.number="filters.limit"
              label="Limit"
              type="number"
              min="1"
              dense
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-select
              filled
              v-model="filters.sortBy"
              label="Sort By"
              :options="sortByOptions"
              dense
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-select
              filled
              v-model="filters.sortOrder"
              label="Sort Order"
              :options="sortOrderOptions"
              dense
            />
          </div>
        </div>

        <div v-if="urlMetrics && urlMetrics.total_page_views !== undefined">
          <p class="text-body1">
            <strong>Total Visitors:</strong>
            {{ urlMetrics.total_unique_visitors }}
          </p>

          <q-table
            flat
            bordered
            :rows="urlMetrics.url_rankings"
            :columns="urlColumns"
            row-key="url"
            hide-pagination
            :rows-per-page-options="[0]"
            v-if="urlMetrics.url_rankings && urlMetrics.url_rankings.length"
          >
            <template v-slot:no-data>
              <q-card-section class="full-width text-center">
                <q-icon name="link" size="lg" color="grey" />
                <div class="text-grey q-mt-sm">
                  No URL data available for the selected period with current
                  filters.
                </div>
              </q-card-section>
            </template>
          </q-table>
          <p v-else class="text-grey-7 q-mt-md">
            No URL ranking data available for the selected period with current
            filters.
          </p>
        </div>
        <div v-else-if="!loading && !error">
          <q-card-section class="full-width text-center">
            <q-icon name="link" size="lg" color="grey" />
            <div class="text-grey q-mt-sm">
              Click 'Refresh Metrics' to load URL data.
            </div>
          </q-card-section>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { default as dayjs } from 'dayjs';
import { getUrlMetrics, getCountryMetrics } from 'src/api';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  name: 'MetricsDialog',
  components: {},
  data() {
    const now = dayjs();
    const thirtyDaysAgo = now.subtract(30, 'day');
    return {
      filters: {
        startDate: thirtyDaysAgo.format('YYYY/MM/DD'),
        endDate: now.format('YYYY/MM/DD'),
        limit: 10,
        sortBy: 'views',
        sortOrder: 'desc',
      },
      loading: false,
      error: false,
      urlMetrics: null,
      countriesMetrics: null,
      // Options for Q-Select components
      sortByOptions: [
        { label: 'Views', value: 'views' },
        { label: 'Unique Views', value: 'unique_views' },
        { label: 'Average Speed', value: 'avg_speed' },
        { label: 'Error Rate', value: 'error_rate' },
        { label: 'URL', value: 'url' },
      ],
      sortOrderOptions: [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
      ],

      // Column definitions for Q-Table
      countryColumns: [
        {
          name: 'country',
          required: true,
          label: 'Country',
          align: 'left',
          field: 'country',
          sortable: true,
        },
        {
          name: 'views',
          label: 'Views',
          align: 'right',
          field: 'views',
          sortable: true,
        },
      ],
      urlColumns: [
        {
          name: 'url',
          required: true,
          label: 'URL',
          align: 'left',
          field: 'url',
          sortable: true,
        },
        {
          name: 'views',
          label: 'Views',
          align: 'right',
          field: 'views',
          sortable: true,
        },
        {
          name: 'unique_views',
          label: 'Unique Views',
          align: 'right',
          field: 'unique_views',
          sortable: true,
        },
        {
          name: 'avg_speed',
          label: 'Avg Speed (s)',
          align: 'right',
          field: (row) =>
            row.avg_speed !== null ? row.avg_speed.toFixed(2) : 'N/A',
          sortable: true,
        },
        {
          name: 'error_count',
          label: 'Errors',
          align: 'right',
          field: 'error_count',
          sortable: true,
        },
        {
          name: 'error_rate',
          label: 'Error Rate (%)',
          align: 'right',
          field: (row) => row.error_rate.toFixed(2),
          sortable: true,
        },
      ],
    };
  },
  methods: {
    /**
     * Formats a date string from HTML input (YYYY-MM-DDTHH:MM) to ISO 8601 with 'Z' for UTC.
     * This is the format your Flask endpoint expects.
     */
    formatDateToISO(dateString) {
      if (!dateString) return null;
      // dayjs can parse 'YYYY-MM-DDTHH:mm' directly
      return dayjs(dateString)
        .toISOString()
        .replace(/\.\d{3}Z$/, 'Z'); // Ensure no milliseconds and ends with 'Z'
    },

    /**
     * Formats an ISO 8601 string for human-readable display using Day.js.
     */
    formatDateDisplay(isoString) {
      if (!isoString) return 'N/A';
      // Use Day.js to parse and format
      return dayjs(isoString).format('YYYY-MM-DD HH:mm:ss'); // Example format, customize as needed
    },
    async fetchMetrics() {
      this.loading = true;
      this.error = null;
      this.urlMetrics = null;
      this.countriesMetrics = null;
      try {
        // Construct query parameters
        const paramsUrls = {
          start_time: this.formatDateToISO(this.filters.startDate),
          end_time: this.formatDateToISO(this.filters.endDate),
          limit: this.filters.limit,
          sort_by: this.filters.sortBy,
          sort_order: this.filters.sortOrder,
        };

        const paramsCountries = {
          start_time: this.formatDateToISO(this.filters.startDate),
          end_time: this.formatDateToISO(this.filters.endDate),
          sort_order: this.filters.sortOrder,
        };

        // Make the API request
        const responseCountries = await getCountryMetrics(paramsCountries);
        if (this.currentUserIsStaff) {
          const responseUrls = await getUrlMetrics(paramsUrls);
          this.urlMetrics = responseUrls.data;
        }
        // Assign the fetched data to the component's data property
        this.countriesMetrics = responseCountries.data;
      } catch (err) {
        console.error('Error fetching metrics:', err);
        this.error = 'Failed to fetch metrics.';
        if (err.response) {
          // If the error has a response from the server (e.g., 400, 404, 500)
          this.error =
            err.response.data.message || err.response.statusText || this.error;
        } else if (err.request) {
          // The request was made but no response was received (e.g., network error)
          this.error =
            'No response from server. Check network connection or API URL.';
        } else {
          // Something else happened in setting up the request
          this.error = err.message;
        }
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    route() {
      this.showTermsAndConditionsDialog = false;
      this.showPrivacyPolicyDialog = false;
    },
    showPrivacyPolicyDialog(newv) {
      if (newv) {
        window.history.pushState({}, '');
      }
    },
    showTermsAndConditionsDialog(newv) {
      if (newv) {
        window.history.pushState({}, '');
      }
    },
  },
  mounted() {
    this.fetchMetrics();
  },
  computed: {
    route() {
      return this.$route;
    },
    ...mapState(useAuthStore, ['currentUserIsStaff']),
  },
};
</script>

<style lang="scss">
.about-dialog {
  max-height: 680px !important;
  .header {
    position: sticky;
    top: 0;
    z-index: 6;
    width: 100%;
  }
  .polaroid-container {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 16px;
    padding-bottom: 48px;
    box-shadow: 10px 10px 14px rgba(0, 0, 0, 0.2);
    transform: rotate(-7deg) scale(0.8);
    background: linear-gradient(white, #fafafa);
    cursor: zoom-in;
    .image-container {
      position: relative;
      .image-overlay {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 2;
        top: 0px;
      }
      .image-attribute {
        position: absolute;
        bottom: 0px;
        right: 0px;
        z-index: 5;
        background: black;
        padding: 2px;
        margin: 10px;
        opacity: 0.5;
        font-size: 8pt;
        color: white;
        a {
          color: white;
        }
      }
    }
  }
}
// sm
@media only screen and (max-width: 599px) {
}
</style>
