<template>
  <div class="google-event-result q-pa-md flex row">
    <div class="flex column">
      <div class="text-large t1">{{ result.title }}</div>
      <div class="text-large t1">Type: {{ result.type }}</div>
      <div class="t2">Description:{{ result.description }}</div>
      <div class="t2">Additional Info: {{ result.additionalInfo }}</div>
      <div class="t2">Dates: {{ result.dates }}</div>
      <div class="t2">Venues: { result._embedded?.venues }}</div>
      <div class="t2">Place: { result.place }}</div>
      <div>
        URL: <a :href="result.url" class="t2">{{ result.url }}</a>
      </div>
      <div v-for="(link, index) of result.externalLinks" :key="index">
        Link: <a :href="resulinklt.url" class="t2">{{ link }}</a>
      </div>
      <div class="flex row q-gutter-sm">
        <img
          v-for="(image, index) in result.images"
          :key="index"
          :src="image.url"
          style="max-height: 200px"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    result: {
      default: null,
    },
  },
  data() {
    return {};
  },
  methods: {},
  watch: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
  .google-event-result {
    border: 1px solid $bi-3;
  }
}

.body--light {
  .google-event-result {
    border: 1px solid $bi-1;
  }
}
.google-event-result {
  &:hover {
    opacity: 0.9;
  }
}
@media only screen and (max-width: 600px) {
}
</style>
