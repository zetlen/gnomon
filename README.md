# gnomon

A command line utility, a bit like
[moreutils's **ts**](https://joeyh.name/code/moreutils/), to prepend timestamp
information to the standard output of another command. Useful for long-running
processes where you'd like a historical record of what's taking so long.

## Example

![gnomonbasic](https://github.paypal.com/github-enterprise-assets/0001/4863/0001/4054/39c069be-d724-11e5-9652-b61b26073fc1.gif)

Piping anything to `gnomon` will prepend a timestamp to each line, indicating 
how long that line was the last line in the buffer--that is, how long it took
the next line to appear. By default, `gnomon` will display the seconds elapsed
between each line, but that is configurable.

You can display total time elapsed since the process begain:
![gnomoneltotal](https://github.paypal.com/github-enterprise-assets/0001/4863/0001/4056/39c33e14-d724-11e5-9ae9-ef18daf02a2f.gif)

You can display an absolute timestamp:
![gnomonabsolute](https://github.paypal.com/github-enterprise-assets/0001/4863/0001/4055/39c15e00-d724-11e5-8569-4ed7295932e0.gif)

You can also use the `--high` and/or `--medium` options to specify a length
threshold in seconds, over which `gnomon` will highlight the timestamp in red
or yellow. And you can do a few other things, too.

![gnomonfancy](https://github.paypal.com/github-enterprise-assets/0001/4863/0001/4057/39c7d4e2-d724-11e5-85b5-beba5ef0dfa5.gif)

## Options

    --type=<elapsed-line|elapsed-total|absolute>        [default: elapsed-line]
    -t <elapsed-line|elapsed-total|absolute>

      Type of timestamp to display.
        elapsed-line: Number of seconds that displayed line was the last line.
        elapsed-total: Number of seconds since the start of the process.
        absolute: An absolute timestamp in UTC.

    --format="format"                                   [default: "H:i:s.u O"]
    -f "format"

      Format the absolute timestamp, using PHP date format strings. If the type
      is elapsed-line or elapsed-total, this option is ignored.

    --ignore-blank                                      [default: false]
    --quiet
    -q
    -i

      Do not prepend a timestamp to blank lines; just pass them through. When
      this option is active, blank lines will not trigger an update of elapsed
      time. Therefore, if a lot of blank lines appear, the prior timestamp will
      display the total time between that line and the next non-blank line
      (if the type is elapsed-time was selected).

    --high=seconds
    -h seconds

      High threshold. If the elapsed time for a line is equal to or higher than
      this value in seconds, then the timestamp will be colored bright red.
      This works for all timestamp types, including elapsed-total and absolute,
      where the elapsed line time is not actually displayed.

    --medium=seconds
    -m seconds

      Medium threshold. Works just like the high threshold described above, but
      colors the timestamp bright yellow instead. Can be used in conjunction
      with a high threshold for three levels.

If a `high` and/or a `medium` threshold are specified, then all timestamps not
meeting that threshold will be colored bright green.
