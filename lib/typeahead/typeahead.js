(function (Vue) {
    Vue.component('typeahead', {
        props: {
            value: {
                type: String,
                required: true
            },
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
            selection: function (newValue) {
                console.log("selection ", newValue);
                this.search();
                this.$emit('input', newValue)
            },
            value: function (newValue) {
                console.log("value ", newValue);
                this.selection = newValue;
            }
        },
        data: function () {
            return {
                selection: this.value,
                suggestions: [],
                editing: true,
                width: '400px'
            };
        },
        mounted: function(){
            var $input = this.$el.querySelector("input");
            this.width = $input.offsetWidth + 'px';
            
        },
        methods: {
            search: function () {
                var self = this;

                if (!this.editing || this.selection.length < this.minLength) {
                    this.suggestions = [];
                    return;
                }

                axios
                    .get(this.url + '?q=' + this.selection)
                    .then(function (response) {
                        data = response.data.map(function (c) { return self.propertyName ? c[self.propertyName] : c; });

                        var filtered = data.filter(function (str) {
                            return str.toLowerCase().indexOf(self.selection.toLowerCase()) >= 0;
                        }).slice(0, 10);

                        if (filtered.length === 1 && filtered[0] === self.selection)
                            self.suggestions = [];
                        self.suggestions = filtered;
                    })
            },
            select: function(value) {
                console.log("select: ", value);
                this.selection = value;
                this.editing = false;
            },
            blur: function() {
                console.log("blur");
                // el timeout es para darle tiempo al select si se seleccionó algún valor
                var self = this;
                setTimeout(function () { self.editing = false; }, 500);
            },
            focus: function() {
                console.log("focus");
                this.editing = true;
            }
        },
        template:
            '<div class="form-group">' +
            '   <input class="form-control" type="text" v-model="selection" v-on:change="$emit(\'input\', selection)" v-on:blur="blur" v-on:focus="focus" />' +
            '   <ul class="list-group" style="position: absolute;" v-bind:style="{width: width}" v-if="editing">' +
            '       <li class="list-group-item" v-for="suggestion in suggestions" v-on:click="select(suggestion)">' +
            '           {{ suggestion }}' +
            '       </li>' +
            '   </ul>' +
            '</div >'
    });
})(Vue);