(function (Vue) {
    Vue.component('typeahead', {
        props: {
            suggestions: {
                type: Array,
                required: true
            },
            minLength: {
                type: Number,
                required: true
            }
        },
        watch: {
            selection(newValue) {
                this.editing = true;
                this.$emit('input', newValue)
            },
            value(newValue) {
                this.selection = newValue
            }
        },
        data() {
            return {
                selection: '',
                editing: true
            };
        },
        computed: {
            //Filtering the suggestion based on the input
            matches() {
                if (!this.editing || this.selection.length < this.minLength) return [];

                var m = this.suggestions.filter((str) => {
                    return str.toLowerCase()
                        .indexOf(this.selection.toLowerCase()) >= 0;
                }).slice(0, 10);

                if (m.length === 1 && m[0] === this.selection)
                    return [];
                return m;
            },
        },
        methods: {
            select(value) {
                console.log("select: ", value);
                this.selection = value;
            },
            blur() {
                // el timeout es para darle tiempo al select si se seleccionó algún valor
                setTimeout(function () { this.editing = false; }, 500);
            }
        },
        template:
            '<div class="form-group">' +
            '   <input class="form-control" type="text" v-model="selection" @change="$emit(\'input\', selection)" v-on:blur="blur"/>' +
            '   <ul class="list-group" style="position: absolute; width: 300px">' +
            '       <li class="list-group-item" v-for="suggestion in matches" v-on:click="select(suggestion)">' +
            '           {{ suggestion }}' +
            '       </li>' +
            '   </ul>' +
            '</div >'
    });
})(Vue);