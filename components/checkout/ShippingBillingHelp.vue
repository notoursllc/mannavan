<script>
    import Vue from 'vue'
    import { Dialog, Button } from 'element-ui'

    Vue.use(Dialog)
    Vue.use(Button)

    export default {
        data: function() {
            return {
                modalIsActive: false
            }
        }
    }
</script>


<template>
    <div>
        <div class="fwb">{{ $t('Make sure your address is correct') }}</div>
        {{ $t('correct_address_statement') }}

        <div>
            <el-button type="text" @click="modalIsActive = true">{{ $t('Tips for entering addresses') }}</el-button>
        </div>

        <!-- Address help popup -->
        <el-dialog :title="$t('About Billing and Shipping Addresses')"
                   :visible.sync="modalIsActive"
                   :modal-append-to-body="false"
                   width="90%">
            <div class="tal">
                <div class="colorGray fs16 mbl pbl bbGray">
                    Error-free shipping and billing addresses will avoid unnecessary delays and get your packages delivered as quickly as possible!
                </div>

                <div class="qaRow">
                    <label>Your billing address must match the address that appears on your monthly credit card or bank statement.</label>
                    <div class="qaVal">
                        Be sure to check your statement for accuracy.
                    </div>
                </div>

                <div class="qaRow">
                    <label>Leave fields blank if they don't apply to your shipping or billing address.</label>
                    <div class="qaVal">
                        Leave fields blank if they don't apply to your shipping or billing address.Do not enter "N/A," "Not applicable," "None," "Same," etc.
                    </div>
                </div>

                <div class="qaRow">
                    <label>Enter information in the appropriate fields.</label>
                    <div class="qaVal">
                        For example, do not enter city and state information in the "Address Line 2" field; use the provided city and state fields instead.
                    </div>
                </div>

                <div class="qaRow">
                    <label>Avoid using accent marks or non-English characters.</label>
                    <div class="qaVal">
                        Our systems can't process Chinese characters, Cyrillic letters, etc., and entering these into any of the address fields may delay shipments of your packages.
                    </div>
                </div>

                <div class="qaRow">
                    <label>Do not enter shipping or delivery instructions in any of the address fields.</label>
                    <div class="qaVal">
                        We are unable to accommodate requests for specific shippers.
                    </div>
                </div>

                <div class="qaRow">
                    <label>If you're having trouble getting your address to fit on Address Lines 1 and 2, here are some common U.S. Postal Service abbreviations that might help:</label>
                    <div class="qaVal pll">
                        <ul class="disc">
                            <li>Apartment: APT</li>
                            <li>Avenue: AVE</li>
                            <li>Beach: BCH</li>
                            <li>Boulevard: BLVD</li>
                            <li>Building: BLDG</li>
                            <li>Canyon: CYN</li>
                            <li>Center: CTR</li>
                            <li>Circle: CIR</li>
                            <li>Court: CT</li>
                            <li>Crescent: CRES</li>
                            <li>Crossing: XING</li>
                            <li>Department: DEPT</li>
                            <li>Drive: DR</li>
                            <li>Expressway: EXPY</li>
                            <li>Falls: FLS</li>
                            <li>Field: FLD</li>
                            <li>Floor: FL</li>
                            <li>Fort: FT</li>
                            <li>Gardens: GDNS</li>
                            <li>Harbor: HBR</li>
                            <li>Heights: HTS</li>
                            <li>Highway: HWY</li>
                            <li>Hills: HLS</li>
                            <li>Island: IS</li>
                            <li>Junction: JCT</li>
                            <li>Lake: LK</li>
                            <li>Landing: LDG</li>
                            <li>Lane: LN</li>
                            <li>Lodge: LDG</li>
                            <li>Mount: MT</li>
                            <li>Mountain: MTN</li>
                            <li>Office: OFC</li>
                            <li>Parkway: PKWY</li>
                            <li>Penthouse: PH</li>
                            <li>Plaza: PLZ</li>
                            <li>Point: PT</li>
                            <li>Post Office Box: P.O. Box</li>
                            <li>Road: RD</li>
                            <li>Room: RM</li>
                            <li>Route: RTE</li>
                            <li>Square: SQ</li>
                            <li>Station: STA</li>
                            <li>Street: ST</li>
                            <li>Suite: STE</li>
                            <li>Terrace: TER</li>
                            <li>Turnpike: TPKE</li>
                            <li>Valley: VLY</li>
                        </ul>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>


<style lang="scss">
.qaRow {
    margin-bottom: 25px;

    label {
        font-weight: bold;
    }

    .qaVal {
        padding-left:10px;
    }
}
</style>
