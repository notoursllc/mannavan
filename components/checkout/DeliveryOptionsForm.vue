<script>
import { mapGetters } from 'vuex';
import { email, required } from 'vuelidate/lib/validators';

import {
    FigButton,
    FigOverlay,
    FigFormInput,
    FigSelectCountry,
    FigSelectStateProvince,
    FigFormGroup
} from '@notoursllc/figleaf';


function getSetFactory(attr) {
    return {
        get: function() {
            const val = this.cart[`${this.type}_${attr}`];

            // the getter gets called whenever a state value changes
            this.form[attr] = val;

            return val;
        },
        set: function(newVal) {
            this.$store.dispatch('cart/ATTRIBUTE_SET', {
                attribute: `${this.type}_${attr}`,
                value: newVal
            });

            switch(attr) {
                // case 'email':
                //     this.delayTouch(this.$v.form.email, 1000);
                //     break;

                default:
                    this.$v.form[attr].$touch();
            }
        }
    };
}


export default {
    components: {
        FigButton,
        FigOverlay,
        FigFormInput,
        FigSelectCountry,
        FigSelectStateProvince,
        FigFormGroup
    },

    props: {
        type: {
            type: String,
            default: 'shipping' // shipping, billing
        }
    },

    data: function() {
        return {
            loading: false,
            form: {
                countryCodeAlpha2: null,
                firstName: null,
                lastName: null,
                streetAddress: null,
                extendedAddress: null,
                city: null,
                state: null,
                postalCode: null,
                company: null,
                phone: null,
                email: null
            },
            showExtendedAddress: false,
            twoColRowClasses: 'flex flex-wrap -mx-3',
            twoColCellClasses: 'w-full my-3 px-3 sm:w-1/2',
            threeColCellClasses: 'w-full my-3 px-3 sm:w-1/3'
        };
    },

    validations: function() {
        let baseValidation = {
            countryCodeAlpha2: { required },
            firstName: { required },
            lastName: { required },
            streetAddress: { required },
            extendedAddress: {}, // no validation needed
            city: { required },
            state: { required },
            postalCode: { required },
            phone: { required },
            // company: {} // no validation needed
            email: { required, email }
        };

        // if(this.type === 'shipping') {
        //     baseValidation.email = { required, email };
        // }

        return {
            form: baseValidation
        };
    },

    computed: {
        ...mapGetters({
            cart: 'cart/cart'
        }),

        countryCodeAlpha2: getSetFactory.call(this, 'countryCodeAlpha2'),
        firstName: getSetFactory.call(this, 'firstName'),
        lastName: getSetFactory.call(this, 'lastName'),
        streetAddress: getSetFactory.call(this, 'streetAddress'),
        extendedAddress: getSetFactory.call(this, 'extendedAddress'),
        city: getSetFactory.call(this, 'city'),
        state: getSetFactory.call(this, 'state'),
        postalCode: getSetFactory.call(this, 'postalCode'),
        email: getSetFactory.call(this, 'email'),
        phone: getSetFactory.call(this, 'phone'),
        company: getSetFactory.call(this, 'company')
    },

    methods: {
        async saveDeliveryOptions() {
            this.loading = true;

            try {
                const stateData = {};

                for(const key in this.form) {
                    stateData[`shipping_${key}`] = this.form[key];
                }

                const { data } = await this.$api.cart.update({
                    id: this.$store.state.cart.cart.id,
                    ...stateData
                });

                await this.$store.dispatch('cart/CART', data);

                this.$emit('saved');
            }
            catch(err) {
                console.log('ERR', err);

                this.$errorToast({
                    title: this.$t('Error')
                    // text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }

            this.loading = false;

            // TODO: dispatch an event so user can go to step 2
        },

        canShowValidationMsg(attr) {
            switch(attr) {
                case 'email':
                    return this.$v.form.email.$dirty;

                default:
                    // return true;
                    return this.$v.form[attr].$dirty && !this.$v.form[attr].required;
            }
        },

        inputState(attr) {
            if(!this.$v.form[attr].$dirty) {
                return null;
            }
            else {
                switch(attr) {
                    case 'email':
                        return !this.$v.form.email.email ? false : null;

                    default:
                        return !this.$v.form[attr].required ? false : null;
                }
            }
        }
    }
};
</script>


<template>
    <fig-overlay :show="loading">
        <div :class="twoColRowClasses">
            <!-- first name -->
            <div :class="twoColCellClasses">
                <fig-form-group>
                    <fig-form-input
                        v-model="firstName"
                        size="lg"
                        @input="$v.form.firstName.$touch()"
                        :state="inputState('firstName')">
                        <template slot="label">{{ $t('First name') }}</template>
                    </fig-form-input>

                    <div slot="error" v-show="canShowValidationMsg('firstName')">{{ $t('Required') }}</div>
                </fig-form-group>
            </div>

            <!-- last name -->
            <div :class="twoColCellClasses">
                <fig-form-group>
                    <fig-form-input
                        v-model="lastName"
                        size="lg"
                        @input="$v.form.lastName.$touch()"
                        :state="inputState('lastName')">
                        <template slot="label">{{ $t('Last name') }}</template>
                    </fig-form-input>

                    <div slot="error" v-show="canShowValidationMsg('lastName')">{{ $t('Required') }}</div>
                </fig-form-group>
            </div>
        </div>

        <!-- street address -->
        <div class="pb-3">
            <fig-form-group>
                <fig-form-input
                    v-model="streetAddress"
                    size="lg"
                    @input="$v.form.streetAddress.$touch()"
                    :state="inputState('streetAddress')">
                    <template slot="label">{{ $t('Address') }}</template>
                </fig-form-input>

                <div slot="error" v-show="canShowValidationMsg('streetAddress')">{{ $t('Required') }}</div>
            </fig-form-group>
        </div>

        <div class="pb-3 text-gray-500" v-if="!showExtendedAddress">
            <fig-button
                variant="naked"
                icon="plus"
                size="sm"
                @click="showExtendedAddress = true">{{ $t('Add Company, C/O, Apt, Suite, Unit') }}</fig-button>
        </div>

        <!-- extended address -->
        <div class="pb-3">
            <fig-form-input
                v-if="showExtendedAddress"
                v-model="extendedAddress"
                size="lg" />
        </div>

        <!-- country -->
        <div class="pb-2">
            <fig-form-group>
                <fig-select-country
                    v-model="countryCodeAlpha2"
                    :placeholder="$t('Country')"
                    size="lg"
                    @input="$v.form.countryCodeAlpha2.$touch()"
                    :state="inputState('countryCodeAlpha2')" />

                <div slot="error" v-show="canShowValidationMsg('countryCodeAlpha2')">{{ $t('Required') }}</div>
            </fig-form-group>
        </div>

        <div :class="twoColRowClasses">
            <!-- city -->
            <div :class="threeColCellClasses">
                <fig-form-group>
                    <fig-form-input
                        v-model="city"
                        size="lg"
                        @input="$v.form.city.$touch()"
                        :state="inputState('city')">
                        <template slot="label">{{ $t('City') }}</template>
                    </fig-form-input>

                    <div slot="error" v-show="canShowValidationMsg('city')">{{ $t('Required') }}</div>
                </fig-form-group>
            </div>

            <!-- state -->
            <div :class="threeColCellClasses">
                <fig-form-group>
                    <fig-select-state-province
                        :country="countryCodeAlpha2"
                        v-model="state"
                        :clearable="false"
                        class="w-full"
                        :placeholder="$t('State/Province/Region')"
                        size="lg"
                        @input="$v.form.state.$touch()"
                        :state="inputState('state')" />

                    <div slot="error" v-show="canShowValidationMsg('state')">{{ $t('Required') }}</div>
                </fig-form-group>
            </div>

            <!-- zip -->
            <div :class="threeColCellClasses">
                <fig-form-group>
                    <fig-form-input
                        v-model="postalCode"
                        size="lg"
                        @input="$v.form.postalCode.$touch()"
                        :state="inputState('postalCode')">
                        <template slot="label">{{ $t('Postal code') }}</template>
                    </fig-form-input>

                    <div slot="error" v-show="canShowValidationMsg('postalCode')">{{ $t('Required') }}</div>
                </fig-form-group>
            </div>
        </div>

        <div :class="twoColRowClasses">
            <!-- email -->
            <div :class="twoColCellClasses">
                <fig-form-group>
                    <fig-form-input
                        v-model="email"
                        size="lg"
                        @input="$v.form.email.$touch()"
                        :state="inputState('email')">
                        <template slot="label">{{ $t('Email') }}</template>
                    </fig-form-input>

                    <div slot="error" v-show="canShowValidationMsg('email')">
                        <p v-if="!$v.form.email.required">{{ $t('Required') }}</p>
                        <p v-if="!$v.form.email.email">{{ $t('Please enter a valid email address.') }}</p>
                    </div>
                </fig-form-group>
            </div>

            <!-- phone number -->
            <div :class="twoColCellClasses">
                <fig-form-group>
                    <fig-form-input
                        v-model="phone"
                        size="lg"
                        @input="$v.form.phone.$touch()"
                        :state="inputState('phone')">
                        <template slot="label">{{ $t('Phone number') }}</template>
                    </fig-form-input>

                    <div slot="error" v-show="canShowValidationMsg('phone')">{{ $t('Required') }}</div>
                </fig-form-group>
            </div>
        </div>

        <div class="flex justify-end pt-1 w-full">
            <fig-button
                variant="primary"
                @click="saveDeliveryOptions"
                :disabled="$v.form.$invalid">{{ $t('Save & Continue') }}</fig-button>
        </div>
    </fig-overlay>
</template>
