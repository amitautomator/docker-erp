/* <Card className="border-neutral-200 dark:border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Item Types</CardTitle>
            <CardDescription className="text-xs">
              Shared across all invoice types.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_ITEM_TYPES.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="capitalize px-3 py-1 text-xs"
                >
                  {t}
                  <span className="ml-1.5 opacity-40 text-[10px]">default</span>
                </Badge>
              ))}
              {customItemTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setCustomItemTypes((p) => p.filter((x) => x !== t))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-1 text-xs font-medium capitalize hover:bg-red-600 dark:hover:bg-red-500 dark:hover:text-white transition-colors"
                >
                  {t}
                  <IconX className="h-3 w-3" />
                </button>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Add item type..."
                className="h-9 text-sm"
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomItemType())
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={addCustomItemType}
              >
                <IconPlus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card> */
