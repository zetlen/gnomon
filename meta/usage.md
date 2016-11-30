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

	--real-time=<number|false>                          [default: 500]
	-r                                                  [non-tty default: false]

	  Time increment to use when updating timestamp for the current line, in
	  milliseconds. Pass `false` to this option to disable realtime entirely,
	  if you need an extra performance boost or you find it distracting. When
	  realtime is disabled, the log will always appear one line "behind" the
	  original piped output, since it can't display the line until it's
	  finished timing it.

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

### Notes
 - If a `high` and/or a `medium` threshold are specified, then all timestamps not
meeting that threshold will be colored bright green.
 - If you pipe the output of `gnomon` into another command or a file (that is,
 not a tty) then the `real-time` option will be disabled by default and each line
 will appear only after it has been timed. You can force realtime by sending a
 `--real-time=<ms>` argument explicitly, but the ANSI codes would probably
 interfere with whatever you were trying to do. The sane default is to omit fancy
 stuff, like colors and escape sequences, when logging text directly to a file.