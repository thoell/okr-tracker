<template>
  <div class="selected-user">
    <slot name="back"></slot>

    <div class="selected-user__main">
      <h2 class="title-2">{{ $t('admin.users.edit') }}</h2>
      <validation-observer v-slot="{ handleSubmit }">
        <form id="user-form" @submit.prevent="handleSubmit(save)">
          <label class="form-group">
            <span class="form-label">{{ $t('fields.email') }}</span>
            <input v-model="thisUser.id" class="form__field" type="email" disabled />
          </label>

          <form-component
            v-model="thisUser.displayName"
            input-type="input"
            name="name"
            :label="$t('fields.displayName')"
            rules="required"
            type="text"
          />

          <label class="form-group--checkbox">
            <span class="form-label">{{ $t('general.admin') }}</span>
            <input
              v-model="thisUser.admin"
              class="form__checkbox"
              type="checkbox"
              :disabled="user.email === thisUser.email"
            />
          </label>
        </form>
      </validation-observer>
      <div>
        <span class="form-label">{{ $t('admin.users.image') }}</span>
        <div class="image">
          <img v-if="thisUser.photoURL" :src="thisUser.photoURL" class="image__image" />
          <input type="file" accept="image/png, image/jpeg" class="image__field" @input="setImage" />
          <button v-if="thisUser.photoURL" class="btn" :disabled="!image || loading" @click="deleteImage">
            {{ $t('btn.deleteImage') }}
          </button>
        </div>
      </div>
    </div>

    <div class="selected-user__footer">
      <button class="btn" form="user-form" :disabled="loading">{{ $t('btn.saveChanges') }}</button>
      <button class="btn btn--danger" :disabled="user.email === thisUser.email || loading" @click="remove(thisUser)">
        {{ $t('btn.deleteUser') }}
      </button>
    </div>
  </div>
</template>

<script>
import User from '@/db/User';
import { mapState } from 'vuex';

export default {
  name: 'EditUser',

  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
  },

  props: {
    selectedUser: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    thisUser: null,
    image: null,
    loading: false,
  }),

  computed: {
    ...mapState(['user']),
  },

  watch: {
    selectedUser: {
      immediate: true,
      handler() {
        this.image = null;
        this.thisUser = this.selectedUser;
      },
    },
  },

  methods: {
    async remove(user) {
      this.loading = true;
      try {
        await User.remove(user);
        this.$toasted.show(this.$t('toaster.delete.user', { user: user.displayName }));
        this.$emit('close');
      } catch {
        this.$toasted.error(this.$t('toaster.error.user', { user: user.displayName }));
      }
      this.loading = false;
    },

    setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
      this.uploadImage();
    },

    async uploadImage() {
      this.loading = true;
      try {
        const url = await User.uploadImage(this.user.id, this.image);
        this.image = null;
        this.thisUser.photoURL = url;
        await this.save();
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },

    async deleteImage() {
      this.loading = true;
      try {
        this.thisUser.photoURL = null;
        this.image = null;
        await this.save(this.thisUser);
        await User.deleteImage(this.user.id);
      } catch (error) {
        throw new Error(error.message);
      }

      this.loading = false;
    },

    async save() {
      this.loading = true;
      try {
        this.image = null;
        await User.update(this.thisUser);
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.selected-user {
  padding: 1rem;
}

.selected-user__main {
  margin-top: 1rem;
}

.selected-user__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: auto -0.25rem -0.25rem;

  > .btn {
    margin: 0.25rem;
  }
}

.image {
  display: flex;
}

.image__image {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  background: white;
  border-radius: 2rem;
}
</style>
