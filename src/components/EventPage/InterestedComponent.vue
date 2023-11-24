<template>
  <q-btn
    class="button-light"
    flat
    :size="$q.screen.gt.xs ? '1em' : 'md'"
    :label="$q.screen.gt.xs ? computedLabel : computedLabel"
    :icon="computedIcon"
    icon-right="mdi-chevron-down"
    no-caps
    @click="() => (showingMenu = !showingMenu)"
  >
    <MenuWrapper
      :showing="showingMenu"
      @hide="() => (showingMenu = false)"
      @show="() => (showingMenu = true)"
      class="menu-wrapper inter bold"
    >
      <q-list>
        <q-item
          v-close-popup
          :active="userInterested"
          clickable
          @click="
            currentUser
              ? toggleInterested()
              : $router.push({
                  path: '/login',
                  query: { from: $route.path },
                })
          "
        >
          <q-item-section avatar>
            <q-icon :name="userInterested ? 'mdi-star' : 'mdi-star-outline'" />
          </q-item-section>
          <q-item-section>Interested</q-item-section>
        </q-item>
        <q-item
          :active="userGoing"
          v-close-popup
          clickable
          @click="
            currentUser
              ? toggleGoing()
              : $router.push({
                  path: '/login',
                  query: { from: $route.path },
                })
          "
        >
          <q-item-section avatar>
            <q-icon
              :name="
                userGoing ? 'mdi-check-circle' : 'mdi-check-circle-outline'
              "
            />
          </q-item-section>
          <q-item-section>Going</q-item-section>
        </q-item>
      </q-list>
    </MenuWrapper>
  </q-btn>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import MenuWrapper from 'src/components/Controls/MenuWrapper.vue';

export default {
  components: { MenuWrapper },
  props: {},
  data() {
    return {
      loading: false,
      showingMenu: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['toggleInterested', 'toggleGoing']),
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, [
      'event',
      'loadingEventDate',
      'selectedEventDateIndex',
      'selectedEventDate',
      'editing',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    userGoing() {
      return this.selectedEventDate?.user_going;
    },
    userInterested() {
      return this.selectedEventDate?.user_interested;
    },
    computedIcon() {
      if (this.userGoing) {
        return 'mdi-check-circle';
      } else if (this.userInterested) {
        return 'mdi-star';
      } else return 'mdi-star-outline';
    },
    computedLabel() {
      if (this.userGoing) {
        return 'Going';
      } else if (this.userInterested) {
        return 'Interested';
      } else {
        return 'You';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
