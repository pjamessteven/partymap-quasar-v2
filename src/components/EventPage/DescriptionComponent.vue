<template>
  <div v-if="!!event">
    <div class="flex column q-mb-md">
      <div
        class="metropolis bolder text-h6 t1 q-pr-md q-mb-sm event-page-header"
      >
        {{ $t('event.description') }}:
      </div>

      <div class="description text-large" :class="editing ? 'editing ' : ''">
        <div
          @click="openEditorDialog()"
          class="editing-outline"
          :class="editing ? 'q-pa-md' : ''"
        >
          <span
            v-if="event.full_description?.length > 0"
            style="white-space: pre-line; word-break: break-word"
          >
            <span v-if="!showOriginal">{{
              event.full_description_t || event.full_description
            }}</span>
            <span v-else>{{ event.full_description }}</span
            >&nbsp;<span
              class="o-050"
              v-if="
                event.full_description_attribute &&
                event.full_description_attribute.length > 0
              "
            >
              <p />
              <a class="link-hover" target="_blank" :href="computedAttributeUrl"
                >[{{ computedAttributeDomain }}]</a
              ></span
            ><span v-if="isTranslation">
              <p />

              <span class="o-040" v-if="!showOriginal">
                - {{ $t('translate.translated') }}&nbsp;</span
              >
              <span
                class="o-040 link-hover"
                @click="showOriginal = !showOriginal"
                >[<span v-if="!showOriginal">{{
                  $t('translate.show_original')
                }}</span
                ><span v-else>{{ $t('translate.show_translation') }}</span
                >]</span
              ></span
            ></span
          ><span v-else class="t4 inter text-large q-mt-sm">
            {{ $t('event.add_description') }}
          </span>
        </div>
      </div>
    </div>
    <BackdropBlurDialog
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditDescriptionDialog @closeDialog="showEditingDialog = false" />
    </BackdropBlurDialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import EditDescriptionDialog from './EditDescriptionDialog.vue';
import BackdropBlurDialog from 'src/components/BackdropBlurDialog.vue';
export default {
  components: { EditDescriptionDialog, BackdropBlurDialog },
  props: {
    editing: Boolean,
  },
  data() {
    return {
      showEditingDialog: false,
      readMore: false,
      showOriginal: false,
    };
  },
  methods: {
    openEditorDialog() {
      if (this.editing) {
        this.showEditingDialog = true;
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event']),
    isTranslation() {
      return (
        this.event?.description_t &&
        this.event?.description !== this.event?.description_t
      );
    },
    shouldTruncate() {
      return (
        this.truncatedDescription?.length < this.event?.full_description?.length
      );
    },
    truncatedDescription() {
      // consider descriptions with short paragraphs at the beginning
      const paragraphs = this.event.full_description
        ?.split('\n')
        .filter((x) => x.length > 0);
      console.log(paragraphs);
      const firstParagraph = paragraphs?.[0];
      const secondParagraph = paragraphs?.[1];
      const thirdParagraph = paragraphs?.[2];

      if (firstParagraph?.length > 300) {
        return firstParagraph;
      } else if ((firstParagraph + secondParagraph).length > 300) {
        return firstParagraph + '\n\n' + secondParagraph;
      } else {
        let amalagamtion = firstParagraph;

        if (secondParagraph) {
          amalagamtion += '\n\n' + secondParagraph;
        }
        if (thirdParagraph) {
          amalagamtion += '\n\n' + thirdParagraph;
        }
        return amalagamtion;
      }
    },
    computedAttributeUrl() {
      if (this.event?.full_description_attribute?.length > 0) {
        // ensure that there is a protocol prefix
        if (
          this.event.full_description_attribute.indexOf('http://') < 0 &&
          this.event.full_description_attribute.indexOf('https://') < 0
        ) {
          return '//' + this.event.full_description_attribute;
        } else return this.event.full_description_attribute;
      } else {
        return null;
      }
    },
    computedAttributeDomain() {
      if (this.event?.full_description_attribute?.length > 0) {
        let domain = this.event.full_description_attribute;

        if (
          domain.indexOf('facebook.com') > -1 ||
          domain.indexOf('fb.me') > -1
        ) {
          return 'Facebook page';
        }
        // ensure that there is a protocol prefix
        if (domain.indexOf('http://') > -1 || domain.indexOf('https://') > -1) {
          domain = domain.split('://')[1];
        }
        if (domain.indexOf('www.') > -1) {
          domain = domain.split('www.')[1];
        }
        if (domain.indexOf('/')) {
          domain = domain.split('/')[0];
        }
        return domain;
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 1023px) {
}
</style>
