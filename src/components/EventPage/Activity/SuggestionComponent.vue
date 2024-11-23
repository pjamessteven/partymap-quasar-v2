<template>
  <div
    class="suggestion flex column"
    :style="
      suggestion.status == 'approved' || suggestion.status == 'hidden'
        ? 'opacity: 0.48'
        : ''
    "
  >
    <div class="flex column grow">
      <div
        class="flex column q-pa-sm"
        :class="{
          delete: suggestion.action === 'delete',
          update: suggestion.action === 'update',
          create: suggestion.action === 'create',
        }"
      >
        <div class="flex column no-wrap justify-between">
          <div class="t1">
            <span v-if="suggestion.creator"
              >{{ suggestion.creator.username }}: &nbsp;</span
            >
            <span class="t1"
              >{{ suggestion.action }}
              {{ suggestion.object_type }}
              <router-link
                class="link-hover underline"
                v-if="
                  suggestion.object_type === 'EventDate' &&
                  suggestion.event_date_id
                "
                :to="{
                  name: 'EventPage',
                  params: {
                    id: suggestion.event_id,
                    eventDateId: suggestion.event_date_id,
                  },
                }"
              >
                {{ suggestion.event_id }}/{{ suggestion.event_date_id }}
              </router-link>

              <router-link
                class="link-hover underline"
                v-else-if="
                  suggestion.object_type === 'Event' && suggestion.event_id
                "
                :to="{
                  name: 'EventPage',
                  params: {
                    id: suggestion.event_id,
                  },
                }"
              >
                {{ suggestion.event_id }}
              </router-link>

              <span
                v-else-if="
                  suggestion.object_type === 'EventDate' &&
                  !suggestion.event_date_id
                "
                >[TARGET DELETED]</span
              >
              <span
                v-else-if="
                  suggestion.object_type === 'Event' && !suggestion.event_id
                "
                >[TARGET DELETED]</span
              >
            </span>
          </div>
          <div class="t3">
            {{ timeAgo(suggestion.created_at) }}
            {{ dateTimeUTCToLocal(suggestion.created_at) }}
          </div>
          <div class="t1">
            <span>
              Message:
              <span v-if="!suggestion.message">None</span></span
            >&nbsp;{{ suggestion.message }}
          </div>
        </div>
      </div>
      <div
        class="changes q-py-sm"
        v-if="computedKeys && computedKeys.length > 0"
      >
        <div
          v-for="(key, index) in computedKeys"
          :key="index"
          class="flex column q-px-sm"
        >
          <div class="t3">{{ key }}</div>
          <div v-if="key === 'media_items'">
            <div
              v-for="(media, mediaIndex) in suggestion.kwargs['media_items']"
              :key="mediaIndex"
            >
              <img
                class="preview"
                :src="media.base64File"
                v-if="media.mimeType.indexOf('image') > -1"
              />
              <video
                v-else-if="media.mimeType.indexOf('video') > -1"
                class="preview"
                controls
              >
                <source :src="media.base64File" :type="media.mimeType" />
                <q-icon size="1em" name="las la-play" />
              </video>
            </div>
          </div>
          <div v-else-if="key === 'rrule'" class="">
            {{ recurringPatternKebab(suggestion.kwargs?.[key]) }}
          </div>
          <div v-else-if="key === 'location'" class="">
            {{ suggestion.kwargs[key].description }}
          </div>
          <div v-else-if="key === 'date_time'" class="">
            Start:
            {{
              dayjs(suggestion.kwargs[key].start).format('MMMM Do YYYY, h:mm a')
            }}
            <br />
            End:
            {{
              dayjs(suggestion.kwargs[key].end).format('MMMM Do YYYY, h:mm a')
            }}
          </div>
          <div
            v-else-if="
              key === 'add_artists' ||
              key === 'remove_artists' ||
              key === 'update_artists'
            "
          >
            <div class="flex column">
              <ArtistListItem
                :artist="item"
                :key="index"
                v-for="(item, index) in suggestion.kwargs?.[key]"
              />
            </div>
          </div>
          <div v-else>
            {{ suggestion.kwargs?.[key] }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="t3 justify-end flex row q-ma-md"
      v-if="suggestion.status === 'approved'"
    >
      <div v-if="suggestion.approved_by && suggestion.approved_by.username">
        Approved by:
        {{ suggestion.approved_by.username }}
      </div>
    </div>
    <div
      class="flex row action-buttons q-ma-sm justify-end items-stretch"
      v-if="suggestion.status == 'pending' || suggestion.status === 'hidden'"
    >
      <q-btn
        class=""
        size="1em"
        color="grey-8"
        label="Hide"
        flat
        @click="hide()"
      />
      <q-btn
        class="q-pa-none"
        size="1em"
        label="Approve"
        flat
        color="primary"
        @click="approve()"
      />
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </div>
</template>

<script>
import ArtistListItem from 'src/components/EventPage/EventDates/Artists/ArtistListItem.vue';
import common from 'assets/common';
import { updateSuggestionRequest } from 'src/api';
import { default as dayjs } from 'dayjs';

import { mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  components: {
    ArtistListItem,
  },
  props: { item: Object },
  data() {
    return {
      loading: false,
      suggestion: { ...this.item },
      ignoredKeys: ['creator_id'],
    };
  },
  methods: {
    ...mapActions(useEventStore, ['reloadEvent']),
    approve() {
      this.loading = true;
      updateSuggestionRequest(this.suggestion.id, { status: 'approved' }).then(
        (response) => {
          if (this.$route.name === 'EventPage') {
            this.reloadEvent();
          }
          this.suggestion = response.data;
          this.loading = false;
        }
      );
    },
    hide() {
      this.loading = true;
      updateSuggestionRequest(this.suggestion.id, { status: 'hidden' }).then(
        (response) => {
          this.suggestion = response.data;
          this.loading = false;
        }
      );
    },
  },
  watch: {},
  computed: {
    computedKeys() {
      if (this.suggestion.kwargs) {
        var keys = Object.keys(this.suggestion.kwargs).filter(
          (key) =>
            this.ignoredKeys.indexOf(key) === -1 &&
            this.suggestion.kwargs?.[key]?.length !== 0
        );
        return keys;
      }
      return [];
    },
  },

  created() {
    this.dateTimeUTCToLocal = common.dateTimeUTCToLocal;
    this.recurringPatternKebab = common.recurringPatternKebab;
    this.timeAgo = common.timeAgo;
    this.dayjs = dayjs;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .suggestion {
    background: $bi-2;
    border: 1px solid rgba(255, 255, 255, 0.1);
    .changes {
      //background: $bi-3;
    }
  }
}

.body--light {
  .suggestion {
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    .update {
      background: lighten(yellow, 45);
    }
    .delete {
      background: lighten(red, 45);
    }
    .create {
      background: lighten(green, 73%);
    }
    .action-buttons {
      //background: $b-2;
      .q-btn {
      }
    }
    .changes {
      //background: $b-3;
    }
  }
}

.suggestion {
  position: relative;
  .header {
    text-transform: capitalize;
  }
}
.preview {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 4px;
  object-fit: cover;
}

@media only screen and (max-width: 1023px) {
}
</style>
