<template>
  <q-list>
    <q-item
      exact
      clickable
      :to="{
        name: 'FeaturedEvents',
      }"
      active-class="item-active"
      exact-active-class="item-active"
    >
      <q-item-section avatar>
        <q-avatar font-size="24pt" left>✨</q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="inter bold text-large">
          {{ $t('browse_page.featured_events') }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      :to="{
        name: 'BrowseEventDateList',
        params: {
          country: 'all',
        },
      }"
      active-class="item-active"
      exact-active-class="item-active"
    >
      <q-item-section avatar>
        <q-avatar font-size="24pt" left>🌎 </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="inter bold text-large">
          {{ $t('browse_page.all_events') }}
        </q-item-label>

        <q-item-label caption
          >{{ countries?.[0]?.event_count }}&nbsp;{{
            $t('browse_page.upcoming_events')
          }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-expansion-item
      active-class="item-active"
      :to="{
        name: 'BrowseEventDateList',
        params: {
          country: country.short_name,
        },
      }"
      :ref="`country-${country.short_name}`"
      expand-icon-toggle
      v-for="(country, index) in countries.slice(1)"
      :key="index"
      :model-value="expanded === country.short_name"
      @update:model-value="clickExpansionItem(country)"
      :content-inset-level="1"
    >
      <template v-slot:header-right>
        <q-spinner-dots v-if="isLoading" color="primary" size="1em" />
      </template>
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar left text-color="white" font-size="28pt">
            {{
              countryCodes.find((x) => x.code == country.short_name)?.emoji_flag
            }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label
            class="inter bold"
            v-if="country.short_name !== 'ALL_COUNTRIES'"
            >{{
              countryCodes.find((x) => x.code == country.short_name)?.name
            }}</q-item-label
          >
          <q-item-label v-else class="inter bold">
            {{ $t('browse_page.all_countries') }}
          </q-item-label>

          <q-item-label caption
            >{{ country.event_count }}&nbsp;{{
              $t('browse_page.upcoming_events')
            }}
          </q-item-label>
        </q-item-section>
      </template>
      <q-list>
        <q-item
          exact
          clickable
          :to="{
            name: 'BrowseEventDateList',
            params: {
              country: country.short_name,
            },
          }"
          active-class="item-active"
        >
          <q-item-section>
            <q-item-label class="inter bold">
              {{ $t('browse_page.all_regions') }}
            </q-item-label>

            <q-item-label caption
              >{{ country.regions?.[0].event_count }}&nbsp;{{
                $t('browse_page.upcoming_events')
              }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-for="(region, index) in country.regions?.slice(1)"
          :ref="`region-${region.long_name}`"
          :key="index"
          clickable
          :to="{
            name: 'BrowseEventDateList',
            params: {
              country: country.short_name,
              region: region.long_name,
            },
          }"
          active-class="item-active"
        >
          <q-item-section>
            <q-item-label class="inter bold">{{
              region.long_name
            }}</q-item-label>

            <q-item-label caption
              >{{ region.event_count }}&nbsp;{{
                $t('browse_page.upcoming_events')
              }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useBrowseStore } from 'src/stores/browse';
import InnerLoading from 'src/components/InnerLoading.vue';
import countryCodes from 'src/assets/country-code-emoji';

export default {
  name: 'BrowsePage',
  components: {
    InnerLoading,
  },
  props: {},
  data() {
    return { expanded: null };
  },
  async mounted() {
    await this.loadCountries();
    const countryCode = this.$route.params.country;
    const region = this.$route.params.region;
    if (countryCode) {
      await this.loadCountryRegions(countryCode);
      this.$nextTick(() => {
        let element = this.$refs[`country-${countryCode}`]?.[0];
        element?.$el.scrollIntoView({
          behavior: 'smooth',
          block: 'start', // 'start', 'center', 'end', or 'nearest'
        });

        if (region) {
          this.expanded = countryCode;
          /*
          setTimeout(() => {
            const regionElement = this.$refs[`region-${region}`][0];
            regionElement?.$el.scrollIntoView({
              behavior: 'smooth',
              block: 'start', // 'start', 'center', 'end', or 'nearest'
            });
          }, 500);
          */
        }
      });
    }
  },
  methods: {
    ...mapActions(useBrowseStore, ['loadCountries', 'loadCountryRegions']),
    async clickExpansionItem(country) {
      if (!country.regions) {
        await this.loadCountryRegions(country.short_name);
      }
      if (this.expanded === country.short_name) {
        this.expanded = null;
      } else {
        this.expanded = country.short_name;
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useBrowseStore, ['countries']),
  },
  created() {
    this.countryCodes = countryCodes;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .q-expansion-item {
    :deep(.q-expansion-item__container) {
      .item-active {
        background: $bi-3 !important;
      }
    }
  }
  .item-active {
    background: $bi-3 !important;
  }
}

.body--light {
  .q-expansion-item {
    :deep(.q-expansion-item__container) {
      .item-active {
        background: $b-2 !important;
      }
    }
  }
  .item-active {
    background: $b-2 !important;
  }
}

.q-item {
  border-top-right-radius: 40px;
  border-bottom-right-radius: 40px;
  opacity: 1;
  &.item-active {
    opacity: 1;
  }
}

.q-expansion-item {
  :deep(.q-item) {
    border-top-right-radius: 40px;
    border-bottom-right-radius: 40px;
    opacity: 1;
    &.item-active {
      opacity: 1;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media only screen and (max-width: 599px) {
}
</style>
