<script>
import { email, required } from 'vuelidate/lib/validators';
import ContentCard from '@/components/ContentCard.vue';

import {
    FigContent,
    FigLabelValueGroup,
    FigLabelValue,
    FigFormInput,
    FigFormTextarea,
    FigButton,
    FigOverlay,
    FigIcon
} from '@notoursllc/figleaf';

export default {
    components: {
        ContentCard,
        FigContent,
        FigLabelValueGroup,
        FigLabelValue,
        FigFormInput,
        FigFormTextarea,
        FigButton,
        FigOverlay,
        FigIcon
    },

    head() {
        return {
            title: this.$t('Contact BreadVan'),
            meta: [
                { vmid: 'description', name: 'description', content: 'Contact us' }
            ]
        };
    },

    data() {
        return {
            loading: false,
            showSuccess: false,
            form: {
                name: null,
                company: null,
                email: null,
                message: null,
            }
        }
    },

    validations: function() {
        return {
            form: {
                name: { required },
                email: { required, email },
                message: { required },
            }
        }
    },

    methods: {
        async onSubmit() {
            try {
                this.loading = true;
                await this.$api.tenant.contactUs(this.form);

                this.showSuccess = true;
                this.form.name = null;
                this.form.company = null;
                this.form.email = null;
                this.form.message = null;
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });
                console.error(err);
            }

            this.loading = false;
        }
    }
};
</script>


<template>
    <fig-content size="sm" class="pt-10">

        <!-- success message -->
        <template v-if="showSuccess">
            <div class="text-center">
                <div class="flex justify-center">
                    <fig-icon
                        icon="check-circle"
                        stroke-width="1.5"
                        width="80"
                        height="80"
                        variant="success" />
                </div>
                <div class="mt-1 text-2xl">{{ $t('Thank you!') }}</div>
                <div class="text-base">{{ $t("Your message has been sent.") }}</div>
            </div>
        </template>

        <!-- form -->
        <template v-else>
            <div class="text-center mb-6">
                <div class="flex justify-center">
                    <fig-icon icon="mail" stroke-width="1px" width="80" height="80" />
                </div>
                <div class="mt-1 text-2xl">{{ $t('We want to hear from you!') }}</div>
                <div class="text-base">{{ $t("We'll get back to you within 1 business day.") }}</div>
            </div>

            <content-card>
                <fig-overlay :show="loading">
                    <div class="text-left">
                        <fig-label-value-group density="lg" block>
                            <!-- Your name -->
                            <fig-label-value required>
                                    <template v-slot:label>{{ $t('Your name') }}:</template>
                                    <fig-form-input
                                        v-model="form.name"
                                    maxlength="100"
                                    @input="$v.$touch()" />
                                <template v-slot:error v-if="$v.form.name.$dirty && !$v.form.name.required">{{ $t('required') }}</template>
                            </fig-label-value>

                            <!-- Company -->
                            <fig-label-value>
                                <template v-slot:label>{{ $t('Company') }}:</template>
                                <fig-form-input
                                    v-model="form.company"
                                    maxlength="100" />
                            </fig-label-value>

                            <!-- Email -->
                            <fig-label-value required>
                                <template v-slot:label>{{ $t('Email') }}:</template>
                                <fig-form-input
                                    v-model="form.email"
                                    maxlength="100"
                                    @input="$v.$touch()" />

                                <template v-slot:error v-if="$v.form.email.$dirty && $v.form.email.$invalid">
                                    <div v-if="!$v.form.email.required">{{ $t('required') }}</div>
                                    <div v-if="$v.form.email.$dirty && !$v.form.email.email">{{ $t('invalid email address format') }}</div>
                                </template>
                            </fig-label-value>

                            <!-- Message -->
                            <fig-label-value required>
                                <template v-slot:label>{{ $t('Message') }}:</template>
                                <fig-form-textarea
                                    v-model="form.message"
                                    maxlength="10000"
                                    @input="$v.$touch()" />

                                <template v-slot:error v-if="$v.form.name.$dirty && !$v.form.message.required">{{ $t('required') }}</template>
                            </fig-label-value>
                        </fig-label-value-group>

                        <div class="pt-5">
                            <fig-button
                                variant="primary"
                                @click="onSubmit"
                                :disabled="$v.form.$invalid > 0"
                                block
                                size="lg">{{ $t('Submit') }}</fig-button>
                        </div>
                    </div>
                </fig-overlay>
            </content-card>
        </template>

    </fig-content>
</template>
