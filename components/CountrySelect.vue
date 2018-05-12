<script>
    import Vue from 'vue'
    import { Select } from 'element-ui'

    Vue.use(Select)

    // NOTE: this object can not be formatted as { US: "United States of America (USA)" }
    // because there are some duplicate 'alpha2' values, like Puerto Rico
    // Also, in order the avoid duplicate <option value> values in the select element,
    // I added a space after any duplicate 'alpha2' values in order to differentiate it.
    // Without that extra space the last of the duplicate values will be displayed as the
    // selected value.  For example, "Puerto Rico" will always be displayed for the "US" value.
    // I hope this works.
    // DATA SOURCE:  http://www.fedex.com/gb/tracking/codes.html
    let countries = [
        {alpha2: 'US', name: 'United States of America (USA)'},
        {alpha2: 'CA', name: 'Canada'},
        {alpha2: 'GB', name: 'Great Britain'},
        {alpha2: 'AD', name: 'Andorra'},
        {alpha2: 'AE', name: 'United Arab Emirates'},
        {alpha2: 'AF', name: 'Afghanistan'},
        {alpha2: 'AG', name: 'Barbuda'},
        {alpha2: 'AI', name: 'Anguilla'},
        {alpha2: 'AL', name: 'Albania'},
        {alpha2: 'AM', name: 'Armenia'},
        {alpha2: 'AO', name: 'Angola'},
        {alpha2: 'AR', name: 'Argentina'},
        {alpha2: 'AS', name: 'American Samoa'},
        {alpha2: 'AT', name: 'Austria'},
        {alpha2: 'AU', name: 'Australia'},
        {alpha2: 'AW', name: 'Aruba'},
        {alpha2: 'AZ', name: 'Azerbaijan'},
        {alpha2: 'BA', name: 'Bosnia-Herzegovina'},
        {alpha2: 'BB', name: 'Barbados'},
        {alpha2: 'BD', name: 'Bangladesh'},
        {alpha2: 'BE', name: 'Belgium'},
        {alpha2: 'BF', name: 'Burkina Faso'},
        {alpha2: 'BG', name: 'Bulgaria'},
        {alpha2: 'BH', name: 'Bahrain'},
        {alpha2: 'BI', name: 'Burundi'},
        {alpha2: 'BJ', name: 'Benin'},
        {alpha2: 'BM', name: 'Bermuda'},
        {alpha2: 'BN', name: 'Brunei'},
        {alpha2: 'BO', name: 'Bolivia'},
        {alpha2: 'BQ', name: 'St. Eustatius'},
        {alpha2: 'BR', name: 'Brazil'},
        {alpha2: 'BS', name: 'Bahamas'},
        {alpha2: 'BT', name: 'Bhutan'},
        {alpha2: 'BW', name: 'Botswana'},
        {alpha2: 'BY', name: 'Belarus'},
        {alpha2: 'BZ', name: 'Belize'},
        {alpha2: 'CD', name: 'Congo, Dem. Rep. of'},
        {alpha2: 'CG', name: 'Congo'},
        {alpha2: 'CH', name: 'Switzerland'},
        {alpha2: 'CI', name: 'Ivory Coast'},
        {alpha2: 'CK', name: 'Cook Islands'},
        {alpha2: 'CL', name: 'Chile'},
        {alpha2: 'CM', name: 'Cameroon'},
        {alpha2: 'CN', name: 'China'},
        {alpha2: 'CO', name: 'Colombia'},
        {alpha2: 'CR', name: 'Costa Rica'},
        {alpha2: 'CS', name: 'Serbia and Montenegro'},
        {alpha2: 'CV', name: 'Cape Verde'},
        {alpha2: 'CW', name: 'Curacao'},
        {alpha2: 'CY', name: 'Cyprus'},
        {alpha2: 'CZ', name: 'Czech Republic'},
        {alpha2: 'DE', name: 'Germany'},
        {alpha2: 'DJ', name: 'Djibouti'},
        {alpha2: 'DK', name: 'Denmark'},
        {alpha2: 'DM', name: 'Dominica'},
        {alpha2: 'DO', name: 'Dominican Republic'},
        {alpha2: 'DZ', name: 'Algeria'},
        {alpha2: 'EC', name: 'Ecuador'},
        {alpha2: 'EE', name: 'Estonia'},
        {alpha2: 'EG', name: 'Egypt'},
        {alpha2: 'ER', name: 'Eritrea'},
        {alpha2: 'ES', name: 'Spain'},
        {alpha2: 'ET', name: 'Ethiopia'},
        {alpha2: 'FI', name: 'Finland'},
        {alpha2: 'FJ', name: 'Fiji'},
        {alpha2: 'FM', name: 'Micronesia'},
        {alpha2: 'FO', name: 'Faeroe Islands'},
        {alpha2: 'FR', name: 'France'},
        {alpha2: 'GA', name: 'Gabon'},
        {alpha2: 'GD', name: 'Grenada'},
        {alpha2: 'GE', name: 'Georgia, Republic of'},
        {alpha2: 'GF', name: 'French Guiana'},
        {alpha2: 'GH', name: 'Ghana'},
        {alpha2: 'GI', name: 'Gibraltar'},
        {alpha2: 'GL', name: 'Greenland'},
        {alpha2: 'GM', name: 'Gambia'},
        {alpha2: 'GN', name: 'Guinea'},
        {alpha2: 'GP', name: 'St. Barthelemy'},
        {alpha2: 'GR', name: 'Greece'},
        {alpha2: 'GT', name: 'Guatemala'},
        {alpha2: 'GU', name: 'Guam'},
        {alpha2: 'GY', name: 'Guyana'},
        {alpha2: 'HK', name: 'Hong Kong'},
        {alpha2: 'HN', name: 'Honduras'},
        {alpha2: 'HR', name: 'Croatia'},
        {alpha2: 'HT', name: 'Haiti'},
        {alpha2: 'HU', name: 'Hungary'},
        {alpha2: 'ID', name: 'Indonesia'},
        {alpha2: 'IE', name: 'Ireland, Republic of'},
        {alpha2: 'IL', name: 'Israel'},
        {alpha2: 'IN', name: 'India'},
        {alpha2: 'IQ', name: 'Iraq'},
        {alpha2: 'IS', name: 'Iceland'},
        {alpha2: 'IT', name: 'Vatican'},
        {alpha2: 'JM', name: 'Jamaica'},
        {alpha2: 'JO', name: 'Jordan'},
        {alpha2: 'JP', name: 'Japan'},
        {alpha2: 'KE', name: 'Kenya'},
        {alpha2: 'KG', name: 'Kyrgyzstan'},
        {alpha2: 'KH', name: 'Cambodia'},
        {alpha2: 'KN', name: 'St. Kitts and Nevis'},
        {alpha2: 'KR', name: 'Korea, South'},
        {alpha2: 'KW', name: 'Kuwait'},
        {alpha2: 'KY', name: 'Cayman Islands'},
        {alpha2: 'KZ', name: 'Kazakhstan'},
        {alpha2: 'LA', name: 'Laos'},
        {alpha2: 'LB', name: 'Lebanon'},
        {alpha2: 'LC', name: 'St. Lucia'},
        {alpha2: 'LI', name: 'Liechtenstein'},
        {alpha2: 'LK', name: 'Sri Lanka'},
        {alpha2: 'LR', name: 'Liberia'},
        {alpha2: 'LS', name: 'Lesotho'},
        {alpha2: 'LT', name: 'Lithuania'},
        {alpha2: 'LU', name: 'Luxembourg'},
        {alpha2: 'LV', name: 'Latvia'},
        {alpha2: 'LY', name: 'Libya'},
        {alpha2: 'MA', name: 'Morocco'},
        {alpha2: 'MC', name: 'Monaco'},
        {alpha2: 'MD', name: 'Moldova'},
        {alpha2: 'MF', name: 'St. Martin'},
        {alpha2: 'MG', name: 'Madagascar'},
        {alpha2: 'MH', name: 'Marshall Islands'},
        {alpha2: 'MK', name: 'Macedonia'},
        {alpha2: 'ML', name: 'Mali'},
        {alpha2: 'MN', name: 'Mongolia'},
        {alpha2: 'MO', name: 'Macau'},
        {alpha2: 'MP', name: 'Saipan'},
        {alpha2: 'MQ', name: 'Martinique'},
        {alpha2: 'MR', name: 'Mauritania'},
        {alpha2: 'MS', name: 'Montserrat'},
        {alpha2: 'MT', name: 'Malta'},
        {alpha2: 'MU', name: 'Mauritius'},
        {alpha2: 'MV', name: 'Maldives, Republic of'},
        {alpha2: 'MW', name: 'Malawi'},
        {alpha2: 'MX', name: 'Mexico'},
        {alpha2: 'MY', name: 'Malaysia'},
        {alpha2: 'MZ', name: 'Mozambique'},
        {alpha2: 'NA', name: 'Namibia'},
        {alpha2: 'NC', name: 'New Caledonia'},
        {alpha2: 'NE', name: 'Niger'},
        {alpha2: 'NG', name: 'Nigeria'},
        {alpha2: 'NI', name: 'Nicaragua'},
        {alpha2: 'NL', name: 'Netherlands'},
        {alpha2: 'NO', name: 'Norway'},
        {alpha2: 'NP', name: 'Nepal'},
        {alpha2: 'NZ', name: 'New Zealand'},
        {alpha2: 'OM', name: 'Oman'},
        {alpha2: 'PA', name: 'Panama'},
        {alpha2: 'PE', name: 'Peru'},
        {alpha2: 'PF', name: 'French Polynesia'},
        {alpha2: 'PG', name: 'Papua New Guinea'},
        {alpha2: 'PH', name: 'Philippines'},
        {alpha2: 'PK', name: 'Pakistan'},
        {alpha2: 'PL', name: 'Poland'},
        {alpha2: 'PS', name: 'Palestine'},
        {alpha2: 'PT', name: 'Portugal'},
        {alpha2: 'PW', name: 'Palau'},
        {alpha2: 'PY', name: 'Paraguay'},
        {alpha2: 'US ', name: 'Puerto Rico'},
        {alpha2: 'QA', name: 'Qatar'},
        {alpha2: 'RE', name: 'Reunion'},
        {alpha2: 'RO', name: 'Romania'},
        {alpha2: 'RU', name: 'Russia'},
        {alpha2: 'RW', name: 'Rwanda'},
        {alpha2: 'SA', name: 'Saudi Arabia'},
        {alpha2: 'SC', name: 'Seychelles'},
        {alpha2: 'SE', name: 'Sweden'},
        {alpha2: 'SG', name: 'Singapore'},
        {alpha2: 'SI', name: 'Slovenia'},
        {alpha2: 'SK', name: 'Slovak Republic'},
        {alpha2: 'SN', name: 'Senegal'},
        {alpha2: 'SR', name: 'Suriname'},
        {alpha2: 'SV', name: 'El Salvador'},
        {alpha2: 'SX', name: 'St. Maarten​'},
        {alpha2: 'SY', name: 'Syria'},
        {alpha2: 'SZ', name: 'Swaziland'},
        {alpha2: 'TC', name: 'Turks and Caicos Islands'},
        {alpha2: 'TD', name: 'Chad'},
        {alpha2: 'TG', name: 'Togo'},
        {alpha2: 'TH', name: 'Thailand'},
        {alpha2: 'TL', name: 'East Timor'},
        {alpha2: 'TN', name: 'Tunisia'},
        {alpha2: 'TO', name: 'Tonga'},
        {alpha2: 'TR', name: 'Turkey'},
        {alpha2: 'TT', name: 'Trinidad and Tobago'},
        {alpha2: 'TW', name: 'Taiwan'},
        {alpha2: 'TZ', name: 'Tanzania'},
        {alpha2: 'UA', name: 'Ukraine'},
        {alpha2: 'UG', name: 'Uganda'},
        {alpha2: 'UY', name: 'Uruguay'},
        {alpha2: 'UZ', name: 'Uzbekistan'},
        {alpha2: 'VC', name: 'St. Vincent'},
        {alpha2: 'VE', name: 'Venezuela'},
        {alpha2: 'VG', name: 'British Virgin Islands'},
        {alpha2: 'VI', name: 'U.S. Virgin Islands'},
        {alpha2: 'VN', name: 'Vietnam'},
        {alpha2: 'VU', name: 'Vanuatu'},
        {alpha2: 'WF', name: 'Wallis & Futuna Islands'},
        {alpha2: 'WS', name: 'Samoa'},
        {alpha2: 'YE', name: 'Yemen, The Republic of'},
        {alpha2: 'ZA', name: 'South African Republic'},
        {alpha2: 'ZM', name: 'Zambia'},
        {alpha2: 'ZW', name: 'Zimbabwe'}
    ];

    export default{
        props: {
            placeholder: {
                type: String,
                default: ''
            },

            // this allows using the `value` prop for a different purpose
            initValue: {
                type: String
            }
        },

        created() {
            this.selectedCountry = this.initValue;
        },

        methods: {
            emitChange(val) {
                this.$emit('change', val)
            },

            emitVisibleChange(val) {
               this.$emit('visible-change', val)
            }
        },

        watch: {
            'initValue' (to, from) {
                this.selectedCountry = to;
            }
        },

        data() {
            return {
                selectedCountry: null,
                countryList: countries
            }
        }
    }
</script>


<template>
    <el-select v-model="selectedCountry"
               filterable
               :placeholder="placeholder"
               :no-match-text="$t('No matching values')"
               @change="emitChange"
               @visible-change="emitVisibleChange"
               class="widthAll">
        <el-option
                v-for="obj in countryList"
                :key="obj.alpha2"
                :label="$t(obj.name)"
                :value="obj.alpha2">
        </el-option>
    </el-select>
</template>
