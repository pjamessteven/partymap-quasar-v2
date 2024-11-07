<template>
  <div class="shadow">
    <EventDateCard :event="event?.next_date" :name="name" :isPopup="true" />
  </div>
</template>

<script>
import EventDateCard from 'components/EventDateCard.vue';
import { getEventRequest } from 'src/api';
export default {
  components: {
    EventDateCard,
  },
  props: {
    eventId: Number,
    name: String,
  },
  data() {
    return {
      loaded: false,
      event: null,
    };
  },
  methods: {},
  computed: {},
  async mounted() {
    const response = await getEventRequest(this.eventId);
    this.event = response.data;
    this.loaded = true;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
.shadow {
  border-radius: 9px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 5px 15px;
  //box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px;
}
</style>
