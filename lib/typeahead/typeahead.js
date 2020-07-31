(function (Vue) {
    Vue.component('typeahead', {
        props: {
            minLength: {
                type: Number,
                required: true
            },
            url: {
                type: String,
                required: true
            },
            propertyName: {
                type: String
            }
        },
        watch: {
            selection(newValue) {
                this.search();
                this.$emit('input', newValue)
            },
            value(newValue) {
                this.selection = newValue
            }
        },
        data() {
            return {
                selection: '',
                suggestions: [],
                editing: true
            };
        },
        computed: {
        },
        methods: {
            search() {
                var self = this;

                if (!this.editing || this.selection.length < this.minLength) {
                    this.suggestions = [];
                    return;
                }

                axios
                    .get(this.url + '?q=' + this.selection)
                    .then(function (response) {
                        data = response.data.map(function (c) { return self.propertyName ? c[self.propertyName] : c; });

                        var filtered = data.filter((str) => {
                            return str.toLowerCase()
                                .indexOf(self.selection.toLowerCase()) >= 0;
                        }).slice(0, 10);

                        if (filtered.length === 1 && filtered[0] === self.selection)
                            self.suggestions = [];
                        self.suggestions = filtered;
                    })
            },
            select(value) {
                console.log("select: ", value);
                this.selection = value;
                this.editing = false;
            },
            blur() {
                // el timeout es para darle tiempo al select si se seleccionó algún valor
                var self=this;
                setTimeout(function () { self.editing = false; }, 500);
            },
            focus() {
                this.editing = true;
            }
        },
        template:
            '<div class="form-group">' +
            '   <input class="form-control" type="text" v-model="selection" v-on:change="$emit(\'input\', selection)" v-on:blur="blur" v-on:focus="focus" />' +
            '   <ul class="list-group" style="position: absolute; width: 80%" v-if="editing">' +
            '       <li class="list-group-item" v-for="suggestion in suggestions" v-on:click="select(suggestion)">' +
            '           {{ suggestion }}' +
            '       </li>' +
            '   </ul>' +
            '</div >'
    });
})(Vue);