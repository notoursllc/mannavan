<script>
    import Vue from 'vue'
    import { mapGetters } from 'vuex'
    import { Input } from 'element-ui'
    import isObject from 'lodash.isobject'
    import forEach from 'lodash.foreach'
    import CountrySelect from '../CountrySelect.vue'
    import StateProvinceSelect from '../StateProvinceSelect.vue'
    import Validations from 'vuelidate'
    import { email, required } from 'vuelidate/lib/validators'

    Vue.use(Input)
    Vue.use(Validations)

    const touchMap = new WeakMap();

    function getSetMaker(attr) {
        return {
            get: function() {
                let val = this.shoppingCart[`${this.type}_${attr}`];

                // the getter gets called whenever a state value changes
                this.form[attr] = val;
                this.greenChecks[attr] = !this.$v.form[attr].$invalid;

                if(attr === 'countryCodeAlpha2') {
                    this.stateSelectEnabled = (isObject(this.shoppingCart) && val);
                }

                return val;
            },
            set: function(newVal) {
                this.$store.dispatch('shoppingcart/ATTRIBUTE_SET', {
                    attribute: `${this.type}_${attr}`,
                    value: newVal
                });

                switch(attr) {
                    case 'email':
                        this.delayTouch(this.$v.form.email, 1000);
                        break;

                    default:
                        this.$v.form[attr].$touch();
                }
            }
        }
    }


    export default {
        components: {
            CountrySelect,
            StateProvinceSelect
        },

        props: {
            type: {
                type: String,
                default: 'shipping' // shipping, billing
            }
        },

        data: function() {
            return {
                stateSelectEnabled: false,
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
                    email: null
                },
                greenChecks: {
                    countryCodeAlpha2: false,
                    firstName: false,
                    lastName: false,
                    streetAddress: false,
                    extendedAddress: false,
                    city: false,
                    state: false,
                    postalCode: false,
                    company: false,
                    email: false,
                }
            }
        },

        computed: {
            ...mapGetters({
                shoppingCart: 'shoppingcart/cart'
            }),

            email: getSetMaker.call(this, 'email'),
            countryCodeAlpha2: getSetMaker.call(this, 'countryCodeAlpha2'),
            firstName: getSetMaker.call(this, 'firstName'),
            lastName: getSetMaker.call(this, 'lastName'),
            streetAddress: getSetMaker.call(this, 'streetAddress'),
            extendedAddress: getSetMaker.call(this, 'extendedAddress'),
            city: getSetMaker.call(this, 'city'),
            state: getSetMaker.call(this, 'state'),
            postalCode: getSetMaker.call(this, 'postalCode'),
            company: getSetMaker.call(this, 'company')
        },


        methods: {
            /**
             * Determine if the green checkmark should be displayed
             */
            canShowGreenCheck(attr) {
                return this.greenChecks[attr] && !this.$v.form[attr].$error;
            },

            /**
             * Determine if the validation error message should be displayed
             */
            canShowValidationMsg(attr) {
                switch(attr) {
                    case 'email':
                        return this.$v.form.email.$dirty

                    default:
                        // return true;
                        return this.$v.form[attr].$dirty && !this.$v.form[attr].required
                }
            },

            delayTouch: function($v, timeout) {
                $v.$reset()
                if (touchMap.has($v)) {
                    clearTimeout(touchMap.get($v))
                }

                if(timeout) {
                    touchMap.set($v, setTimeout($v.$touch, timeout || 1000))
                }
                else {
                   $v.$touch();
                }
            }
        },

        created: function() {
            let blacklist = [];

            if(this.type === 'billing') {
                blacklist.push('email');
            }

            Object.keys(this.form).forEach((key) => {
                // Pre-populate the form values with the respective state values
                if(blacklist.indexOf(key) === -1) {
                    this.form[key] = this.shoppingCart[`${this.type}_${key}`];

                    if(!this.$v.form[key].$invalid) {
                        this.greenChecks[key] = true;
                    }
                }
            });

            this.stateSelectEnabled = (isObject(this.shoppingCart) && this.shoppingCart[`${this.type}_countryCodeAlpha2`])
        },

        watch: {
            '$v.$invalid': function (to, from) {
                // console.log("INVALID WATCH", to, this.$v);
                this.$emit('valid', !to)
            }
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
                company: {} // no validation needed
            }

            if(this.type === 'shipping') {
                baseValidation.email = { required, email }
            }

            return {
                form: baseValidation
            }
        }
    }
</script>


<template>
    <div>
        <!-- Email -->
        <div v-if="type === 'shipping'">
            <div>{{ $t('Email address') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="email"
                          :class="{ 'inputError': $v.form.email.$error }"></el-input>
                <div role="alert" v-show="canShowValidationMsg('email')">
                    <p v-if="!$v.form.email.required">{{ $t('Required') }}</p>
                    <p v-if="!$v.form.email.email">{{ $t('Please enter a valid email address.') }}</p>
                </div>
                <i v-show="canShowGreenCheck('email')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- Country -->
        <div>
            <div>{{ $t('Country') }}</div>
            <div class="checkout_form_value">
                <country-select v-model="countryCodeAlpha2"
                                :init-value="countryCodeAlpha2"
                                @change="newVal => countryCodeAlpha2 = newVal"></country-select>
                <p role="alert" v-show="canShowValidationMsg('countryCodeAlpha2')">{{ $t('Required') }}</p>
                <i v-show="canShowGreenCheck('countryCodeAlpha2')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- First Name -->
        <div>
            <div>{{ $t('First name') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="firstName"
                          :class="{ 'inputError': $v.form.firstName.$error }"></el-input>
                <p role="alert" v-show="canShowValidationMsg('firstName')">{{ $t('Required') }}</p>
                <i v-show="canShowGreenCheck('firstName')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- Last Name -->
        <div>
            <div>{{ $t('Last name') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="lastName"
                          :class="{ 'inputError': $v.form.lastName.$error }"></el-input>
                <p role="alert" v-show="canShowValidationMsg('lastName')">{{ $t('Required') }}</p>
                <i v-show="canShowGreenCheck('lastName')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- Street Address -->
        <div>
            <div>{{ $t('Address line 1') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="streetAddress"
                          :class="{ 'inputError': $v.form.streetAddress.$error }"></el-input>
                <p role="alert" v-show="canShowValidationMsg('streetAddress')">{{ $t('Required') }}</p>
                <i v-show="canShowGreenCheck('streetAddress')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- Extended Address -->
        <!-- This value may be returned by the paypal response, so only displaying it if it does -->
        <div v-if="form.extendedAddress">
            <div>{{ $t('Address line 2') }}:</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="extendedAddress"></el-input>
            </div>
        </div>

        <!-- City -->
        <div>
            <div>{{ $t('City') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="city"
                          :class="{ 'inputError': $v.form.city.$error }"></el-input>
                <p role="alert" v-show="canShowValidationMsg('city')">{{ $t('Required') }}</p>
                <i v-show="canShowGreenCheck('city')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- State -->
        <div>
            <div>{{ $t('State/Province/Region') }}</div>
            <div class="checkout_form_value">
                <state-province-select
                    v-model.trim="state"
                    :init-value="state"
                    :country="countryCodeAlpha2"
                    :disabled="!stateSelectEnabled"
                    @change="newVal => state = newVal"
                    :class="{ 'inputError': $v.form.state.$error }"></state-province-select>
                <p role="alert" v-show="canShowValidationMsg('state')">{{ $t('Required') }}</p>
                <p v-show="!stateSelectEnabled" class="colorGray fs12">{{ $t('Please select a Country first') }}</p>
                <i v-show="canShowGreenCheck('state')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- Postal Code -->
        <div>
            <div>{{ $t('Postal code') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="postalCode"
                        :class="{ 'inputError': $v.form.postalCode.$error }"></el-input>
                <p role="alert" v-show="canShowValidationMsg('postalCode')">{{ $t('Required') }}</p>
                <i v-show="canShowGreenCheck('postalCode')" class="fa fa-check-circle"></i>
            </div>
        </div>

        <!-- Company Name -->
        <div>
            <div>{{ $t('Company name') }}</div>
            <div class="checkout_form_value">
                <el-input v-model.trim="company"
                          :placeholder="'(' + $t('optional') + ')'"></el-input>
                <i v-show="canShowGreenCheck('company')" class="fa fa-check-circle"></i>
            </div>
        </div>
    </div>
</template>


<style lang="scss">
    @import "../../assets/css/components/_variables.scss";

    .inputError input,
    .inputError select {
        border-color: $colorRed !important
    }
</style>
