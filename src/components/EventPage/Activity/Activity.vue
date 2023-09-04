<template>
  <q-card class="change-card">
    <div
      class="change-header flex row items-center justify-between"
      :class="compact ? 'q-pa-sm' : 'q-pa-sm'"
    >
      <div class="flex row items-center">
        <div class="flex column">
          <div class="flex row items-center">
            <router-link
              class="link-hover t1"
              :to="{
                name: 'UserPage',
                params: { username: activity.actor.username },
              }"
            >
              {{ activity.actor.username }}
            </router-link>
            &nbsp;
            <span>{{ getVerb(activity.verb) }}&nbsp;</span>

            <span class="t2" v-if="activity.object_type === 'EventDate'">
              <span class="t2">{{ $t('activity.the_event_date') }}</span>
              <span class="t2">
                {{ activity.object_version.start_naive }} ({{
                  activity.object_version.id
                }})
              </span>
            </span>

            <!-- Event object -->
            <span class="t2" v-else-if="activity.object_type === 'Event'">
              {{ $t('activity.this_event') }}

              <span v-if="activity.verb === 'revert'">
                {{ $t('activity.to_revision') }} #{{
                  activity.data.previous_target_version_tx_id
                }}
              </span>
            </span>
            <!-- Rrule object -->
            <span class="t2" v-else-if="activity.object_type === 'Rrule'">
              <span v-if="activity.verb === 'create'">
                {{ $t('activity.a_recurring_rule_for_event') }}
              </span>
              <span v-else-if="activity.verb === 'delete'">
                {{ $t('activity.the_recurring_rule_for_event') }}
              </span>
              <span v-else-if="activity.verb === 'update'">
                {{ $t('activity.the_recurring_rule_for_event') }}
              </span>
            </span>
            <!-- MediaItem object -->
            <span class="t2" v-else-if="activity.object_type === 'MediaItem'">
              <span
                v-if="
                  activity.verb === 'update' &&
                  computedChangeSet['position'][1] != null &&
                  computedChangeSet['position'][0] != null
                "
              >
                {{ $t('activity.the_position_of') }}
              </span>
              <span v-if="activity.object_version.type === 'image'">{{
                $t('activity.an_image')
              }}</span>
              <span v-else-if="activity.object_version.type === 'video'">{{
                $t('activity.a_video')
              }}</span>
            </span>
            <span class="t2" v-if="activity.object_type === 'EventTag'">
              {{ $t('activity.a_tag') }}
            </span>
          </div>
          <div class="t3" v-if="!compact">
            {{ timeAgo(activity.transaction.issued_at) }}
            ({{ dateTimeUTCToLocal(activity.transaction.issued_at) }})
          </div>
        </div>
      </div>
      <q-btn
        flat
        v-if="expandable"
        :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="expanded = !expanded"
        :size="compact ? 'sm' : 'md'"
        class="t2"
      />
    </div>
    <div class="flex column" v-if="!expandable || (expandable && expanded)">
      <div
        class="media_thumb flex q-mx-sm q-mb-sm"
        v-if="activity.object_type === 'MediaItem'"
      >
        <img
          v-if="activity.object_version"
          :src="activity.object_version.thumb_url"
          style="max-height: 200px"
        />
      </div>

      <!--
    previous_version: {{ activity.previous_version }}
    <p />
    object_version: {{ activity.object_version }}
  -->
      <div
        class="change-set flex column"
        v-for="(changeset, index) in Object.keys(computedChangeSet)"
        :key="index"
      >
        <div
          class="change-set-old flex column q-pa-sm"
          v-if="computedChangeSet[changeset][0] != null"
        >
          <div class="change-set-key t3">
            <span v-if="changeset === 'event_tags'">{{
              $t('activity.removed_a_tag')
            }}</span>
            <span v-else
              >{{ $t('activity.old') }} {{ getChangeSetName(changeset) }}:
            </span>
          </div>
          <div class="change-set-change">
            <span
              v-if="changeset === 'location_id' && activity.previous_version"
              >{{ activity.previous_version.location.description }}</span
            >
            <span
              v-else-if="
                changeset === 'default_location_id' && activity.previous_version
              "
            >
              {{ activity.previous_version.default_location.description }}
            </span>
            <span v-else>{{ computedChangeSet[changeset][0] }}</span>
          </div>
        </div>
        <div
          class="change-set-new flex column q-pa-sm"
          v-if="
            computedChangeSet[changeset][1] != null &&
            computedChangeSet[changeset][1].length != 0
          "
        >
          <div class="change-set-key t3">
            <span v-if="changeset === 'event_tags'">
              {{ $t('activity.added_a_tag') }}
            </span>
            <span v-else-if="computedChangeSet[changeset][1] != null">
              <span v-if="computedChangeSet[changeset][0] != null"
                >{{ $t('activity.new') }}
              </span>
              {{ getChangeSetName(changeset) }}:
            </span>
          </div>
          <div class="change-set-change">
            <span v-if="changeset === 'location_id'">{{
              activity.object_version.location.description
            }}</span>
            <span v-else-if="changeset === 'default_location_id'">{{
              activity.object_version.default_location.description
            }}</span>
            <span v-else>{{ computedChangeSet[changeset][1] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FOR DELETED EVENT DATE SHOW OBJECT VERSION -->
    <div
      class="flex column"
      v-if="
        activity.object_type === 'EventDate' &&
        activity.verb === 'delete' &&
        expanded
      "
    >
      <div
        class="change-set-old flex column q-pa-sm"
        v-for="(property, index) in computedObjectVersion"
        :key="index"
      >
        <div class="change-set-key t3">{{ getChangeSetName(property) }}:</div>
        <div class="change-set-change">
          <span v-if="property == 'location_id'">
            {{ activity.object_version.location.description }}
          </span>
          <span v-else>{{ activity.object_version[property] }}</span>
        </div>
      </div>
    </div>

    <!-- FOR DELETED RRULE SHOW OBJECT VERSION -->
    <div class="flex column" v-if="activity.object_type === 'Rrule'">
      <div
        class="flex column q-pa-sm"
        :class="
          activity.verb === 'delete' ? 'change-set-old' : 'change-set-new'
        "
      >
        <div class="change-set-key t3">
          {{ $t('activity.recurring_rule') }}:
        </div>
        <div class="change-set-change">
          {{ recurringPattern(activity.object_version) }}
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { revertEventActivityRequest } from 'src/api';
import common from 'assets/common';
import moment from 'moment';
import { detailedDiff } from 'deep-object-diff';

export default {
  components: {},
  props: {
    activity: Object,
    compact: Boolean,
  },
  data() {
    return {
      expanded: false,
      ignored_changesets: [
        'start',
        'end',
        'event',
        'event_id',
        'id',
        'created_at',
        'updated_at',
        'creator_id',
        'image_filename',
        'video_low_filename',
        'video_med_filename',
        'video_high_filename',
        'video_poster_filename',
        'tag_id',
        'thumb_filename',
        'type',
        'location', // shows in object_versions, location_id is universal so is used instead
        'changeset',
        'end_transaction_id',
        'previous',
        'transaction_id',
        'transaction',
        'index',
        'day_of_month',
        'day_of_week',
        'month_of_year',
        'recurring_type',
        'week_of_month',
        'separation_count',
      ],
    };
  },
  methods: {
    getVerb(verb) {
      if (verb === 'update') {
        return this.$t('activity.updated');
      } else if (verb === 'create') {
        return this.$t('activity.created');
      } else if (verb === 'delete') {
        return this.$t('activity.deleted');
      } else if (verb === 'revert') {
        return this.$t('activity.reverted');
      } else return null;
    },
    getChangeSetName(changesetName) {
      return this.$t('activity.' + changesetName);
    },
    revertActivity(id) {
      revertEventActivityRequest(id).then(() => {
        this.$store.dispatch('currentEvent/loadEventActivity', this.event.id);
        this.$store.dispatch('currentEvent/loadEvent', this.event.id);
      });
    },
    formatDate(date) {
      return moment(date).utc().format('LLLL');
    },
  },
  watch: {},
  computed: {
    expandable() {
      if (this.activity && this.activity.verb === 'create') {
        if (this.activity.object_type === 'EventDate') {
          return true;
        }
      } else if (this.activity && this.activity.verb === 'delete') {
        if (this.activity.object_type === 'EventDate') {
          return true;
        }
      }
      return false;
    },
    deepDiff() {
      return detailedDiff(
        this.activity.previous_target_version,
        this.activity.target_version
      );
    },
    added() {
      return this.deepDiff.added;
    },
    deleted() {
      return this.deepDiff.deleted;
    },
    updated() {
      var updated = this.deepDiff.updated;
      return Object.keys(updated)
        .filter((key) => this.updatedIgnoreKeys.indexOf(key) < 0)
        .reduce((cur, key) => {
          return Object.assign(cur, { [key]: updated[key] });
        }, {});
    },
    changeSet() {
      if (this.activity != null && this.activity.changeset != null) {
        return this.activity.changeset;
      } else {
        return {};
      }
    },
    computedChangeSet() {
      var changeset = Object.keys(this.activity.changeset)
        .filter((key) => this.ignored_changesets.indexOf(key) === -1)
        .reduce((cur, key) => {
          return Object.assign(cur, { [key]: this.activity.changeset[key] });
        }, {});
      if (this.addedTags || this.removedTags) {
        changeset['event_tags'] = [this.removedTags, this.addedTags];
      }
      if (changeset['start_naive']) {
        if (changeset['start_naive'][0]) {
          changeset['start_naive'][0] = this.formatDate(
            changeset['start_naive'][0]
          );
        }
        if (changeset['start_naive'][1]) {
          changeset['start_naive'][1] = this.formatDate(
            changeset['start_naive'][1]
          );
        }
      }
      if (changeset['end_naive']) {
        if (changeset['end_naive'][0]) {
          changeset['end_naive'][0] = this.formatDate(
            changeset['end_naive'][0]
          );
        }
        if (changeset['end_naive'][1]) {
          changeset['end_naive'][1] = this.formatDate(
            changeset['end_naive'][1]
          );
        }
      }

      return changeset;
    },
    computedObjectVersion() {
      return Object.keys(this.activity.object_version).filter((x) => {
        return (
          this.ignored_changesets.indexOf(x) === -1 &&
          this.activity.object_version[x] != null
        );
      });
    },
    removedTags() {
      var removedTags = [];
      for (var tag of this.activity.previous_target_version.event_tags) {
        if (
          this.activity.target_version.event_tags.findIndex(
            (x) => x.tag === tag.tag
          ) === -1
        ) {
          removedTags.push(tag.tag);
        }
      }
      if (removedTags.length > 0) {
        return removedTags.toString();
      } else {
        return null;
      }
    },
    addedTags() {
      var addedTags = [];
      for (var tag of this.activity.target_version.event_tags) {
        if (
          this.activity.previous_target_version.event_tags.findIndex(
            (x) => x.tag === tag.tag
          ) === -1
        ) {
          addedTags.push(tag.tag);
        }
      }
      if (addedTags.length > 0) {
        return addedTags.toString();
      } else {
        return null;
      }
    },
  },

  created() {
    this.dateTimeUTCToLocal = common.dateTimeUTCToLocal;
    this.recurringPattern = common.recurringPattern;
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .change-set-old {
    background: darken(red, 30);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .change-set-new {
    background: darken(green, 20);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.body--light {
  .change-set-old {
    background: lighten(red, 45);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  .change-set-new {
    background: lighten(green, 73%);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.change-card {
  overflow: hidden;
  box-shadow: none;
  border-radius: 0px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
}
.change-set-old {
  .change-set-change {
    text-decoration: line-through;
  }
}
a {
  text-decoration: none;
  font-weight: 700;
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
