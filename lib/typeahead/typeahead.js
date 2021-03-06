(function (Vue) {
    Vue.component('typeahead', {
        inheritAttrs: false,
        props: {
            value: {
                type: String
            },
            url: {
                type: String,
                required: true
            },
            minLength: {
                type: Number,
                default: 3
            },
            propertyName: {
                type: String
            },
            debug: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            searchText: function (newValue) {
                if (this.debug)
                    console.log("searchText ", newValue);

                this.search();
                this.$emit('input', newValue)
            },
            value: function (newValue) {
                if (this.debug)
                    console.log("value ", newValue);
                this.searchText = newValue;
            }
        },
        data: function () {
            if (this.debug)
                console.log("data");

            return {
                searchText: this.value,
                suggestions: [],
                editing: false,
                selectedIndex: -1,
                width: '400px'
            };
        },
        mounted: function () {
            if (this.debug)
                console.log("mounted");

            var $input = this.$el.querySelector("input");
            this.width = $input.offsetWidth + 'px';
        },
        methods: {
            search: function () {
                var self = this;

                if (!this.editing || this.searchText.length < this.minLength) {
                    this.suggestions = [];
                    return;
                }

                if (this.debug)
                    console.log("searching");

                axios
                    .get(this.url.replace("{value}", this.searchText))
                    .then(function (response) {
                        if (self.debug)
                            console.log("found: ", response);

                        data = response.data.map(function (c) { return self.propertyName ? c[self.propertyName] : c; });

                        var filtered = data.filter(function (str) {
                            return str.toLowerCase().indexOf(self.searchText.toLowerCase()) >= 0;
                        }).slice(0, 10);

                        if (filtered.length === 1 && filtered[0] === self.searchText)
                            self.suggestions = [];
                        self.suggestions = filtered;
                    })
            },
            select: function (value) {
                if (this.debug) console.log("select: ", value);

                this.searchText = value;
                this.editing = false;
            },
            blur: function () {
                if (this.debug) console.log("blur");
                // el timeout es para darle tiempo al select si se seleccionó algún valor
                var self = this;
                setTimeout(function () { self.editing = false; }, 500);
            },
            focus: function () {
                if (this.debug) console.log("focus");
                this.editing = true;
            },
            moveDown: function () {
                if (this.debug) console.log("move down");
                if (this.selectedIndex < this.suggestions.length - 1)
                    this.selectedIndex++;

            },
            moveUp: function () {
                if (this.debug) console.log("move up");
                if (this.selectedIndex > 0)
                    this.selectedIndex--;
            },
            selectSelectedIndex: function () {
                if (this.debug) console.log("select selected index: ", this.selectedIndex);
                if (this.selectedIndex != -1) {
                    this.searchText = this.suggestions[this.selectedIndex];
                    this.suggestions = [];
                    this.editing = false;
                }
            }
        },
        template:
            '<div class="form-group typeahead">' +
            '   <input v-bind="$attrs" class="form-control" type="text" v-model="searchText" autocomplete="off" v-on:change="$emit(\'input\', searchText)" v-on:blur="blur" v-on:focus="focus" ' +
            '          v-on:keyup.enter="selectSelectedIndex" v-on:keydown.down="moveDown" v-on:keydown.up="moveUp"/>' +
            '   <ul class="list-group" style="position: absolute;z-index: 10;" v-bind:style="{width: width}" v-if="editing">' +
            '       <li class="list-group-item" v-for="(suggestion, index) in suggestions" v-bind:class="{active: index==selectedIndex}" v-on:click="select(suggestion)">' +
            '           {{ suggestion }}' +
            '       </li>' +
            '   </ul>' +
            '</div >'
    });
})(Vue);