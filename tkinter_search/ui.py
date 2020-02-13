import json
import math
import tkinter


class SearchField:
    def __init__(self, window, column, row, tag, width=50):
        self._entry = self._new_search_entry(
            window, column=column, row=row, width=width
        )

        self._tag = tag

        self._entry.bind("<KeyRelease>", lambda event: self._onkey(event))

        self._listbox = self._new_list_box(window, column=column, row=row + 1)

        self._listbox.bind("<<ListboxSelect>>", lambda event: self._onselect(event))

        self._items = None
        self._filtered_items = None

        self._selected = None

        self._selection_cb = None
        self._significant_cb = None
        self._significant_coloring_cb = None

    @staticmethod
    def _new_search_entry(window, column, row, width=25):
        entry = tkinter.Entry(window, width=width)
        entry.grid(column=column, row=row)

        return entry

    @staticmethod
    def _new_list_box(window, column, row, height=35):
        frame = tkinter.Frame(window)
        frame.grid(column=column, row=row, sticky=tkinter.W + tkinter.E)

        scrollbarX = tkinter.Scrollbar(frame, orient=tkinter.HORIZONTAL)
        scrollbarY = tkinter.Scrollbar(frame, orient=tkinter.VERTICAL)

        listbox = tkinter.Listbox(
            frame,
            height=height,
            selectmode=tkinter.SINGLE,
            exportselection=False,
            xscrollcommand=scrollbarX.set,
            yscrollcommand=scrollbarY.set,
        )

        scrollbarX.config(command=listbox.xview)
        scrollbarX.pack(side=tkinter.BOTTOM, fill=tkinter.X)

        scrollbarY.config(command=listbox.yview)
        scrollbarY.pack(side=tkinter.RIGHT, fill=tkinter.Y)

        listbox.pack(side=tkinter.LEFT, fill=tkinter.BOTH, expand=1)

        return listbox

    def _onkey(self, event):
        text = str(self._entry.get()).strip()

        self._listbox.delete(0, tkinter.END)

        if text == "":
            self._filtered_items = self._items

            for item in self._items:
                self._listbox.insert(tkinter.END, str(item))

        else:
            if text == "~":
                if self._significant_cb is not None:
                    self._filtered_items = self._significant_cb()

                    for item in self._filtered_items:
                        self._listbox.insert(tkinter.END, str(item))

            else:
                filtered = []
                for item in self._items:
                    found = False
                    ts = text.split(",", -1)

                    for t in ts:
                        if t.strip() == "":
                            continue

                        if t.strip() in str(item).lower():
                            found = True
                        else:
                            found = False
                            break

                    if found:
                        filtered.append(item)

                self._filtered_items = filtered
                for item in filtered:
                    self._listbox.insert(tkinter.END, str(item))

        if self._significant_coloring_cb is not None:
            self._significant_coloring_cb()

    def _onselect(self, event):
        w = event.widget
        selection = w.curselection()

        if len(selection) >= 1:
            index = int(w.curselection()[0])

            self._selected = w.get(index)

            if self._selection_cb is not None:
                self._selection_cb(self._tag)

    def set_listbox_items(self, items):
        self._items = items
        self._filtered_items = items

        for item in items:
            self._listbox.insert(tkinter.END, str(item))

    def set_listbox_items_significant(self, indexes):
        for i in range(len(self._filtered_items)):
            self._listbox.itemconfig(i, {"fg": "black", "bg": "white"})

        for i in indexes:
            self._listbox.itemconfig(i, {"fg": "white", "bg": "blue"})

    def init_search(self):
        self._onkey(None)

    @property
    def tag(self):
        return self._tag

    @property
    def filtered_items(self):
        return self._filtered_items

    @property
    def entry(self):
        return self._entry

    @property
    def listbox(self):
        return self._listbox

    @property
    def selected(self):
        return self._selected

    def set_selection_cb(self, cb):
        self._selection_cb = cb

    def set_significant_cb(self, cb):
        self._significant_cb = cb

    def set_significant_coloring_cb(self, cb):
        self._significant_coloring_cb = cb


class MyApp:
    def __init__(self, statistic, title="Statistic"):
        self._window = tkinter.Tk()
        self._window.title(title)

        self._statistic = statistic

        self._src = SearchField(self._window, 0, 0, "src")
        self._tar = SearchField(self._window, 1, 0, "tar")

        self._src.set_selection_cb(self._selection_cb)
        self._tar.set_selection_cb(self._selection_cb)
        self._tar.set_significant_cb(self._significant_cb)
        self._tar.set_significant_coloring_cb(self._significant_coloring_cb)

        self._src.set_listbox_items(self._statistic.keys())
        self._tar.set_listbox_items(self._statistic.keys())

        self._a_var = tkinter.StringVar()
        self._a_label = tkinter.Label(self._window, textvariable=self._a_var)
        self._a_label.grid(column=0, row=2, columnspan=2, sticky=tkinter.W)

        self._a_var.set("A:")

        self._b_var = tkinter.StringVar()
        self._b_label = tkinter.Label(self._window, textvariable=self._b_var)
        self._b_label.grid(column=0, row=3, columnspan=2, sticky=tkinter.W)

        self._b_var.set("B:")

        self._p_var = tkinter.StringVar()
        self._p_label = tkinter.Label(self._window, textvariable=self._p_var)
        self._p_label.grid(column=0, row=4, columnspan=2, sticky=tkinter.W)

        self._p_var.set("P:")

        self._tau_var = tkinter.StringVar()
        self._tau_label = tkinter.Label(self._window, textvariable=self._tau_var)
        self._tau_label.grid(column=0, row=5, columnspan=2, sticky=tkinter.W)

        self._tau_var.set("TAU:")

    def _significant_cb(self):
        src = self._src.selected
        if src is not None and src != "":
            items = []

            for k, v in self._statistic[src].items():
                if float(v["p"]) < 0.05:
                    items.append(k)

            return items

    def _significant_coloring_cb(self):
        src = self._src.selected
        if src is not None and src != "":
            indexes = []
            for i, v in enumerate(self._tar.filtered_items):
                if float(self._statistic[src][v]["p"]) < 0.05:
                    indexes.append(i)

            self._tar.set_listbox_items_significant(indexes)

    def _selection_cb(self, tag):
        if tag == "src":
            self._tar.init_search()
            self._significant_coloring_cb()

        src = self._src.selected
        tar = self._tar.selected

        self._a_var.set(f"A: {src}")
        self._b_var.set(f"B: {tar}")

        if self._statistic is None:
            return

        sk = self._statistic.get(src, None)
        if sk is not None:
            vk = sk.get(tar, None)

            if vk is not None:
                p = vk.get("p", math.nan)
                tau = vk.get("tau", math.nan)

                self._p_var.set(f"P: {str(p)}")
                self._tau_var.set(f"TAU: {str(tau)}")

    @property
    def window(self):
        return self._window


if __name__ == "__main__":
    stat = None

    with open("statistic.json", "r") as f:
        stat = json.load(f)

    app = MyApp(stat)
    app.window.mainloop()
