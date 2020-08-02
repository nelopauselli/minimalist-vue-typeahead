(function (Vue) {
    Vue.component('typeahead', {
        props: {
            value: {
                type: String,
                required: true
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
            }
        },
        watch: {
            searchText: function (newValue) {
                console.log("searchText ", newValue);
                this.search();
                this.$emit('input', newValue)
            }
        },
        data: function () {
            console.log("data");
            return {
                searchText: this.value,
                suggestions: [],
                editing: true,
                selectedIndex: -1,
                width: '400px'
            };
        },
        mounted: function () {
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

                axios
                    .get(this.url + '?q=' + this.searchText)
                    .then(function (response) {
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
                console.log("select: ", value);
                this.searchText = value;
                this.editing = false;
            },
            blur: function () {
                console.log("blur");
                // el timeout es para darle tiempo al select si se seleccionó algún valor
                var self = this;
                setTimeout(function () { self.editing = false; }, 500);
            },
            focus: function () {
                console.log("focus");
                this.editing = true;
            },
            moveDown: function () {
                console.log("move down");
                if (this.selectedIndex < this.suggestions.length - 1)
                    this.selectedIndex++;

            },
            moveUp: function () {
                console.log("move up");
                if (this.selectedIndex > 0)
                    this.selectedIndex--;
            },
            selectSelectedIndex: function () {
                console.log("select selected index: ", this.selectedIndex);
                if (this.selectedIndex != -1)
                    this.searchText = this.suggestions[this.selectedIndex];
            }
        },
        template:
            '<div class="form-group typeahead">' +
            '   <input class="form-control" type="text" v-model="searchText" v-on:change="$emit(\'input\', searchText)" v-on:blur="blur" v-on:focus="focus" ' +
            '          v-on:keyup.enter="selectSelectedIndex" v-on:keydown.down="moveDown" v-on:keydown.up="moveUp"/>' +
            '   <ul class="list-group" style="position: absolute;z-index: 10;" v-bind:style="{width: width}" v-if="editing">' +
            '       <li class="list-group-item" v-for="(suggestion, index) in suggestions" v-bind:class="{active: index==selectedIndex}" v-on:click="select(suggestion)">' +
            '           {{ suggestion }}' +
            '       </li>' +
            '   </ul>' +
            '</div >'
    });
})(Vue);