<template>
  <div class="upload-component">
    <input
      type="file"
      id="files"
      ref="files"
      accept="image/*,video/*"
      :multiple="singleSelectMode ? false : true"
      v-on:change="appendFiles()"
      class="file-input"
    />
    <div
      class="file-previews flex column align-start items-start q-px-md"
      v-if="items.length > 0"
    >
      <div
        v-for="(item, key) in items"
        class="flex row file-preview no-wrap"
        :key="key"
      >
        <q-btn @click="removeFile(key)" size="sm" class="delete-button" round>
          <q-icon size="1em" name="las la-times" />
        </q-btn>
        <img
          class="preview"
          :src="item.base64File"
          v-if="item.mimeType.indexOf('image') > -1"
        />
        <video
          v-else-if="item.mimeType.indexOf('video') > -1"
          class="preview"
          controls
        >
          <source :src="item.base64File" :type="item.mimeType" />
          <q-icon size="1em" name="las la-play" />
        </video>
        <div class="options flex column justify-between" v-if="!disableCaption">
          <q-input
            autogrow
            outlined
            v-model="item.caption"
            :label="$t('media_upload.caption')"
            @input="emit"
          />
        </div>
      </div>
    </div>
    <div class="bottom-buttons flex row grow justify-start">
      <q-btn
        :label="$t('media_upload.add_media')"
        v-on:click="openSelectDialog()"
        style="width: max-content"
        class="soft-button-shadow"
        color="primary"
        v-if="singleSelectMode && items.length >= 1 ? false : true"
      />
      <q-btn
        v-if="showUploadButton"
        class="q-ml-sm soft-button-shadow"
        :disable="!items || items.length == 0"
        :label="$t('media_upload.upload')"
        v-on:click="$emit('upload')"
        color="primary"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultipleMediaSelector',
  props: {
    openDialogOnMount: Boolean,
    showUploadButton: Boolean,
    singleSelectMode: Boolean,
    disableCaption: Boolean,
  },
  data() {
    return {
      items: [], // an array of {file, caption} objects
    };
  },
  methods: {
    emit() {
      this.$emit('filesSelected', this.items);
    },
    removeFile(key) {
      this.items.splice(key, 1);
    },
    openSelectDialog() {
      this.$refs.files.click();
    },
    appendFiles() {
      let files = this.$refs.files.files;
      for (var j = 0; j < files.length; j++) {
        var file = files[j];
        // convert file to base64 string
        if (/\.(jpe?g|png|gif|webp|avi|mp4|mpeg|webm)$/i.test(file.name)) {
          let reader = new FileReader();
          reader.addEventListener(
            'load',
            () => {
              this.items.push({
                base64File: reader.result,
                caption: null,
                fileName: reader.fileName,
                mimeType: reader.mimeType,
              });
            },
            false
          );
          reader.mimeType = file.type;
          reader.fileName = file.name;
          reader.readAsDataURL(file);
        }
      }
      this.emit();
    },
  },
  mounted() {
    if (this.openDialogOnMount) {
      this.openSelectDialog();
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .file-previews {
    .file-preview {
      background: $bi-1;
      border-color: rgba(0, 0, 0, 0.05);
      .delete-button {
        background-color: $bi-4;
      }
    }
  }

  .bottom-buttons {
    background: $bi-2;
  }
}

.body--light {
  .file-previews {
    .file-preview {
      border-color: rgba(0, 0, 0, 0.1);
      .delete-button {
        background-color: $b-1;
      }
    }
  }
}

input[type='file'] {
  display: none;
  top: -500px;
}
div.file-listing img {
  max-width: 90%;
}
.bottom-buttons {
  position: sticky;
  bottom: 0px;
  z-index: 3;
}

.file-previews {
  .file-preview {
    border: 1px solid;
    border-radius: 10px;
    margin-bottom: 10px;
    position: relative;
    .preview {
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 4px;
      object-fit: cover;
    }
    .delete-button {
      position: absolute;
      left: -10px;
      top: -10px;
      z-index: 2;
    }
    &:last-child {
      margin-bottom: 0px;
    }

    .options {
      margin: 10px;
      flex-grow: 1;
    }
  }
}

.upload-component {
  z-index: 100;
}

.file-input {
  display: none !important;
}
</style>
